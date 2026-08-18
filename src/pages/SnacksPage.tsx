import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import SnacksSection from "@/components/SnacksSection";
import SEO from "@/components/SEO";

const SnacksPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Снеки — м'ясні та рибні категорії | GoldProduct"
        description="Натуральні м'ясні та рибні снеки GoldProduct. Оберіть категорію — джерки, сушене м'ясо, рибні делікатеси преміальної якості."
        path="/snacks"
      />
      <Header />
      <main className="pt-24">
        <h1 className="sr-only">Наші снеки — м'ясні та рибні категорії</h1>
        <SnacksSection />
      </main>
      <FooterSection />
    </div>
  );
};

export default SnacksPage;
