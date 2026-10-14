import { canLoadAccount } from "../services/progressLoader";
import { FriendsContext } from "../hooks/useFriends";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useApiResource } from "../hooks/useApiResource";
import { socialApi, callApi } from "../services/api";
import { adaptRecentCalls } from "../api/recentCallsAdapter";
import { adaptFriend } from "../api/friendsAdapter";
import { adaptAppointments } from "../api/appointmentAdapter";
import {
  incomingScheduleRequestsData,
  incomingFriendRequestsData,
  outgoingFriendRequestsData,
  scheduledSessionsData,
  friendsListData,
} from "../mockdata";

const loadFriends = async () => ({
  friends: friendsListData,
  incomingRequests: incomingFriendRequestsData,
  outgoingRequests: outgoingFriendRequestsData,
  incomingScheduleRequests: incomingScheduleRequestsData,
  scheduledSessions: scheduledSessionsData,
});

function MockFriendsProvider({ children, loader = loadFriends }) {
  const [status, setStatus] = useState("loading"),
    [error, setError] = useState(null),
    [revision, setRevision] = useState(0);
  const [friends, setFriends] = useState(friendsListData),
    [incomingRequests, setIncomingRequests] = useState(incomingFriendRequestsData),
    [outgoingRequests, setOutgoingRequests] = useState(outgoingFriendRequestsData),
    [incomingScheduleRequests, setIncomingScheduleRequests] = useState(
      incomingScheduleRequestsData,
    ),
    [scheduledSessions, setScheduledSessions] = useState(scheduledSessionsData),
    [sentRequests, setSentRequests] = useState(["out-req-1", "out-req-2"]);

  useEffect(() => {
    let active = true;

    loader().then(
      (data) => {
        if (active) {
          setFriends(data.friends);
          setIncomingRequests(data.incomingRequests);
          setOutgoingRequests(data.outgoingRequests || outgoingFriendRequestsData);
          setIncomingScheduleRequests(data.incomingScheduleRequests);
          setScheduledSessions(data.scheduledSessions);
          setStatus("ready");
          setError(null);
        }
      },
      (failure) => {
        if (active) {
          setStatus("error");
          setError(failure);
        }
      },
    );

    return () => {
      active = false;
    };
  }, [loader, revision]);

  const addFriend = useCallback((id) => {
    setSentRequests((current) => (current.includes(id) ? current : [...current, id]));
    setOutgoingRequests((prev) => {
      if (prev.some((r) => r.id === id)) return prev;
      return [
        {
          id,
          name: `Người học #${id}`,
          avatar: `https://i.pravatar.cc/150?u=${id}`,
          mutualFriends: 0,
          requestedAt: "Vừa xong",
          statusText: "Đang chờ chấp nhận",
          isOnline: false,
        },
        ...prev,
      ];
    });
  }, []);

  const removeFriend = useCallback((friendId) => {
    setFriends((prev) => prev.filter((f) => f.id !== friendId));
  }, []);

  const cancelSentRequest = useCallback((requestId) => {
    setOutgoingRequests((prev) => prev.filter((r) => r.id !== requestId));
    setSentRequests((prev) => prev.filter((id) => id !== requestId));
  }, []);

  const retry = useCallback(() => setRevision((value) => value + 1), []);
  const value = useMemo(
    () => ({
      source: "mock",
      status,
      error,
      retry,
      friends,
      setFriends,
      incomingRequests,
      setIncomingRequests,
      outgoingRequests,
      setOutgoingRequests,
      incomingScheduleRequests,
      setIncomingScheduleRequests,
      scheduledSessions,
      setScheduledSessions,
      sentRequests,
      addFriend,
      removeFriend,
      cancelSentRequest,
    }),
    [
      status,
      error,
      retry,
      friends,
      incomingRequests,
      outgoingRequests,
      incomingScheduleRequests,
      scheduledSessions,
      sentRequests,
      addFriend,
      removeFriend,
      cancelSentRequest,
    ],
  );

  return <FriendsContext.Provider value={value}>{children}</FriendsContext.Provider>;
}

const empty = {
  recentCalls: [],
  friends: [],
  incomingRequests: [],
  outgoingRequests: [],
  incomingScheduleRequests: [],
  scheduledSessions: [],
};
const unchanged = () => {};

function ServerFriendsProvider({ children }) {
  const user = useCurrentUser(),
    auth = useAuth(),
    uid = user?.uid,
    enabled = canLoadAccount(uid, auth);
  const [revision, setRevision] = useState(0);
  const retry = useCallback(() => setRevision((value) => value + 1), []);
  const load = useCallback(async () => {
    if (!uid || !enabled) {
      return empty;
    }

    const [friends, incomingRequests, outgoingRequests, appointments, calls] = await Promise.all([
      socialApi.friends(),
      socialApi.requests("incoming"),
      socialApi.requests("outgoing"),
      socialApi.appointments(),
      callApi.history(),
    ]);

    return {
      ...empty,
      ...adaptAppointments(appointments),
      recentCalls: adaptRecentCalls(calls, friends),
      friends: friends.map(adaptFriend),
      incomingRequests: incomingRequests.map(adaptFriend),
      outgoingRequests: outgoingRequests.map(adaptFriend),
    };
  }, [uid, enabled]);
  const { data, error } = useApiResource(load, revision, { keepPrevious: true });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const ping = () => {
      if (document.visibilityState === "visible") {
        socialApi
          .ping()
          .then(retry)
          .catch(() => {});
      }
    };

    ping();

    const timer = setInterval(ping, 10000);

    document.addEventListener("visibilitychange", ping);
    window.addEventListener("focus", ping);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", ping);
      window.removeEventListener("focus", ping);
    };
  }, [enabled, uid, retry]);

  const addFriend = useCallback(
    async (id) => {
      const result = await socialApi.request(id);

      retry();

      return result;
    },
    [retry],
  );
  const decideRequest = useCallback(
    async (request, action) => {
      await socialApi.decide(request.friendshipId, action);
      retry();

      return async () => {
        if (action === "accept") {
          await socialApi.remove(request.friendshipId);
        } else {
          await socialApi.undoRejection(request.friendshipId);
        }

        retry();
      };
    },
    [retry],
  );
  const value = data || empty;
  const createSchedule = useCallback(
    async (body) => {
      const result = await socialApi.schedule(body);
      retry();
      return result;
    },
    [retry],
  );
  const decideSchedule = useCallback(
    async (id, action) => {
      await socialApi.decideSchedule(id, action);
      retry();
    },
    [retry],
  );
  const removeFriend = useCallback(
    async (friendId) => {
      await socialApi.remove(friendId);
      retry();
    },
    [retry],
  );
  const cancelSentRequest = useCallback(
    async (requestId) => {
      try {
        await socialApi.decide(requestId, "cancel");
      } catch {
        await socialApi.remove(requestId);
      }
      retry();
    },
    [retry],
  );
  const context = useMemo(
    () => ({
      ...value,
      source: "server",
      status: !enabled ? "idle" : error ? "error" : data ? "ready" : "loading",
      error,
      retry,
      sentRequests: value.outgoingRequests.map((row) => row.id),
      addFriend,
      removeFriend,
      cancelSentRequest,
      decideRequest,
      createSchedule,
      decideSchedule,
      setFriends: unchanged,
      setIncomingRequests: unchanged,
      setIncomingScheduleRequests: unchanged,
      setScheduledSessions: unchanged,
    }),
    [
      value,
      enabled,
      error,
      data,
      retry,
      addFriend,
      removeFriend,
      cancelSentRequest,
      decideRequest,
      createSchedule,
      decideSchedule,
    ],
  );

  return <FriendsContext.Provider value={context}>{children}</FriendsContext.Provider>;
}

export function FriendsProvider({ children, loader }) {
  return loader || import.meta.env.VITE_USE_MOCK === "true" ? (
    <MockFriendsProvider loader={loader}>{children}</MockFriendsProvider>
  ) : (
    <ServerFriendsProvider>{children}</ServerFriendsProvider>
  );
}
