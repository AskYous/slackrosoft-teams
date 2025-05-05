"use client";
import Link from "next/link";
import { FC } from "react";

export const ChatListItem: FC<{ topic: string; id: string }> = ({
  topic,
  id,
}) => (
  <Link href={`/${id}`}>{topic}</Link>
);
