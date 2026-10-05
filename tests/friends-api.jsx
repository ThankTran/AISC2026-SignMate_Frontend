import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { FriendsProvider } from "../src/contexts/FriendsContext";
import { useFriends } from "../src/hooks/useFriends";
import { useFriendSearch } from "../src/hooks/useFriendSearch";
import { CurrentUserContext } from "../src/hooks/useCurrentUser";
import { socialApi, ApiError } from "../src/services/api";
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const root = createRoot(document.getElementById("root")),
  results = [];
const check = (name, ok) => {
  results.push(`${ok ? "PASS" : "FAIL"} ${name}`);
  document.getElementById("results").textContent = results.join("\n");

  if (!ok) {
    throw Error(name);
  }
};

let friends = [],
  incoming = [
    {
      id: "bob",
      name: "Bob",
      friendshipId: "ab",
      isOnline: false,
      status: "pending",
      direction: "incoming",
    },
  ],
  outgoing = [],
  calls = [],
  fail = false,
  current,
  search,
  setQuery;

socialApi.friends = async () => {
  if (fail) {
    throw new ApiError(503, "raw detail", "SERVICE_UNAVAILABLE");
  }

  return friends;
};

socialApi.requests = async (direction) => (direction === "incoming" ? incoming : outgoing);
socialApi.ping = async () => ({ updated: true });
socialApi.decide = async (id, action) => {
  calls.push(["decide", id, action]);

  if (action === "accept") {
    friends = [{ ...incoming[0], status: "accepted" }];
  }

  incoming = [];
};

socialApi.undoRejection = async (id) => {
  calls.push(["undoRejection", id]);
  incoming = [
    { id: "bob", name: "Bob", friendshipId: "ab", status: "pending", direction: "incoming" },
  ];
};

socialApi.request = async (id) => {
  calls.push(["request", id]);
  outgoing = [{ id, name: "Bob", friendshipId: "ba", status: "pending", direction: "outgoing" }];

  return outgoing[0];
};

socialApi.remove = async (id) => {
  calls.push(["remove", id]);
  friends = [];
};

socialApi.search = async (query) => {
  calls.push(["search", query]);

  return [{ id: "alice", name: "Alice", mutualFriends: 2 }];
};

function Probe() {
  current = useFriends();

  const [query, update] = useState("");

  setQuery = update;
  search = useFriendSearch(query);

  return (
    <p>
      {current.status}: {search.status}
    </p>
  );
}

const render = async (uid) =>
  act(async () =>
    root.render(
      <CurrentUserContext.Provider value={{ uid }}>
        <FriendsProvider>
          <Probe />
        </FriendsProvider>
      </CurrentUserContext.Provider>,
    ),
  );
const wait = async (ms) => act(async () => new Promise((resolve) => setTimeout(resolve, ms)));

try {
  await render("test-only");
  check(
    "friends and incoming/outgoing requests come from server",
    current.source === "server" &&
      current.friends.length === 0 &&
      current.incomingRequests[0].id === "bob",
  );

  const request = current.incomingRequests[0];
  let undo;

  await act(async () => {
    undo = await current.decideRequest(request, "reject");
  });
  check(
    "reject uses friendship id and refreshes incoming",
    calls.some((row) => row.join() === "decide,ab,reject") && current.incomingRequests.length === 0,
  );
  await act(async () => undo());
  check(
    "undo rejection restores original incoming request",
    calls.some((row) => row.join() === "undoRejection,ab") &&
      current.incomingRequests[0]?.friendshipId === "ab",
  );
  incoming = [request];
  await act(async () => current.retry());
  await act(async () => {
    undo = await current.decideRequest(request, "accept");
  });
  check("accept refreshes actual friend list", current.friends[0].id === "bob");
  await act(async () => undo());
  check(
    "undo acceptance removes friendship through API",
    current.friends.length === 0 && calls.some((row) => row.join() === "remove,ab"),
  );
  await act(async () => setQuery("a"));
  await wait(350);
  check(
    "search does not request less than two characters",
    !calls.some((row) => row[0] === "search"),
  );
  await act(async () => setQuery("al"));
  await wait(100);
  await act(async () => setQuery("ali"));
  await wait(350);
  check(
    "search debounces 300ms and cancels superseded query",
    calls.filter((row) => row[0] === "search").length === 1 &&
      calls.find((row) => row[0] === "search")[1] === "ali" &&
      search.data[0].mutualFriends === 2,
  );
  fail = true;
  await act(async () => current.retry());
  check(
    "API errors do not fall back to mock friends",
    current.status === "error" && current.friends.length === 0,
  );
  fail = false;
  await act(async () => current.retry());
  check("retry restores ready state", current.status === "ready");
  await render(undefined);
  check(
    "sign out clears requests and friends",
    current.status === "idle" &&
      current.incomingRequests.length === 0 &&
      current.sentRequests.length === 0,
  );
  document.title = `PASS ${results.length} Friends API checks`;
} catch (error) {
  document.title = "FAIL Friends API";
  document.getElementById("results").textContent += "\n" + error.stack;
}
