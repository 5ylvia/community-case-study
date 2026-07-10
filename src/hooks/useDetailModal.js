import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function useDetailModal(items, paramName = "view") {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState(null);

  // Open modal from URL param
  useEffect(() => {
    const viewId = searchParams.get(paramName);
    if (viewId && items.length > 0) {
      setSelectedId(viewId);
      setSearchParams((prev) => { prev.delete(paramName); return prev; }, { replace: true });
    }
  }, [searchParams, items]);

  const selectedItem = items.find((i) => i.id === selectedId) || null;
  const openDetail = (id) => setSelectedId(id);
  const closeDetail = () => setSelectedId(null);

  return { selectedItem, openDetail, closeDetail, isOpen: !!selectedItem };
}
