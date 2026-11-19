import { HomeHero } from "@/components/hero/HomeHero";
import { DeveloperIntro } from "@/components/home/DeveloperIntro";
import { SelectedWork } from "@/components/home/SelectedWork";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { ContactSection } from "@/components/inquiry/ContactSection";

export default function WebServiceHomePage() {
  return (
    <>
      <HomeHero />
      <SelectedWork />
      <ServicesPreview />
      <DeveloperIntro />
      <ContactSection index="04" />
    </>
  );
}
