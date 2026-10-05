import { createContext, useContext } from "react";
export const FriendsContext = createContext(null);
export const useFriends = () => useContext(FriendsContext);
