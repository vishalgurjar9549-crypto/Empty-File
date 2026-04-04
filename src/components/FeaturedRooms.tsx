import { useEffect } from "react";
import { useAppDispatch } from "../store/hooks";
import { fetchRooms } from "../store/slices/rooms.slice";
import { PropertyRailSection } from "./home/PropertyRailSection";

export function FeaturedRooms() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(
      fetchRooms({
        sort: "most_viewed",
        limit: 30, // fetch more so sections feel real
      })
    );
  }, [dispatch]);

  return <PropertyRailSection />;
}
