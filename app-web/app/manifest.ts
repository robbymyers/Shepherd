import type { MetadataRoute } from "next";

// Declares the launch page so adding Shepherd to the home screen always opens
// the Events feed — not whatever page happened to be showing at "Add to Home
// Screen" time.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shepherd",
    short_name: "Shepherd",
    description: "CrossFit + running performance tracker.",
    start_url: "/",
    display: "standalone",
    background_color: "#171717",
    theme_color: "#171717",
  };
}
