import { useEffect } from "react";

const BASE = "Dajeong";

export default function usePageTitle(title, appendBase = true) {
  useEffect(() => {
    if (!title) { document.title = BASE; return; }
    document.title = appendBase ? `${title} — ${BASE}` : title;
    return () => { document.title = BASE; };
  }, [title, appendBase]);
}
