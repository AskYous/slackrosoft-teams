"use client";
import { Chat } from "@microsoft/microsoft-graph-types";
import { FC } from "react";

export const ChatWindow: FC<{ chat?: Chat }> = ({ chat }) => {
  return <div>{chat?.messages?.length}</div>;
};
