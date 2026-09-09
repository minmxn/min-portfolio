import { useEffect, useState } from "react";
import { Hero } from "@/components/hero";
import { Work } from "@/components/work";
import { KlingCaseStudy } from "@/components/kling-case-study";
import { NomoCaseStudy } from "@/components/nomo-case-study";
import { About } from "@/components/about";
import { Contact } from "@/components/contact";
import { ButtonGallery } from "@/components/button-gallery";

function App() {
  // Simple hash routing: /#work shows the Work view, /#buttons the reference
  // gallery, everything else the Hero.
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  if (hash === "#buttons") return <ButtonGallery />;
  if (hash === "#work") return <Work />;
  if (hash === "#about") return <About />;
  if (hash === "#contact") return <Contact />;
  if (hash === "#kling") return <KlingCaseStudy />;
  if (hash === "#nomo") return <NomoCaseStudy />;
  return <Hero />;
}

export default App;
