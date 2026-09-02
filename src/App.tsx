import { useEffect, useState } from "react";
import { Hero } from "@/components/hero";
import { ButtonGallery } from "@/components/button-gallery";

function App() {
  // Simple hash routing: /#buttons shows the reference gallery, everything
  // else shows the live site.
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  if (hash === "#buttons") return <ButtonGallery />;
  return <Hero />;
}

export default App;
