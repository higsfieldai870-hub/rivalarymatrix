"use client";

import Link from "next/link";
import api from "@/app/components/comparison/api.module.css";
import { Notice, NoticeBlock } from "@/app/components/comparison/Notices";

// Player data couldn't be loaded, usually because the daily BSD quota is used
// up. The response is a server error, so search engines come back later
// instead of indexing this message as the page.
export default function MatchupError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <NoticeBlock>
      <Notice title="Couldn't load the comparison" error>
        The stats service isn&apos;t responding right now. Please try again in a little while.{" "}
        <button type="button" className={api.retryButton} onClick={() => retry()}>
          Try again
        </button>{" "}
        or{" "}
        <Link className={api.inlineLink} href="/rivalries">
          browse popular rivalries
        </Link>
        .
      </Notice>
    </NoticeBlock>
  );
}
