import Link from "next/link";
import api from "@/app/components/comparison/api.module.css";
import { Notice, NoticeBlock } from "@/app/components/comparison/Notices";

// An unknown name, the same player on both sides, or a malformed URL. Served
// as a real 404 so made-up comparison URLs never look like pages.
export default function MatchupNotFound() {
  return (
    <NoticeBlock>
      <Notice title="Comparison not found" error>
        We couldn&apos;t match one of those names to a player, or the same player is on both
        sides.{" "}
        <Link className={api.inlineLink} href="/compare">
          Search for the players again
        </Link>
        .
      </Notice>
    </NoticeBlock>
  );
}
