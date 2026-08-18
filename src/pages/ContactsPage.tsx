import SEO from "@/components/SEO";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const contacts = [
  { icon: Phone, label: "Телефон", value: "+380 44 123 45 67", href: "tel:+380441234567" },
  { icon: Mail, label: "Email", value: "hello@example.com", href: "mailto:hello@example.com" },
  { icon: MapPin, label: "Адреса", value: "Україна, м. Київ", href: null },
  { icon: Clock, label: "Графік", value: "Пн–Пт: 9:00 – 18:00", href: null },
];

const ContactsPage = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "Помилка", description: "Заповніть обов'язкові поля", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("contact_requests").insert({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        message: form.message.trim(),
      });
      if (error) throw error;

      toast({ title: "Дякуємо!", description: "Ваше повідомлення надіслано. Ми зв'яжемося з вами найближчим часом." });
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      toast({ title: "Помилка", description: "Не вдалося надіслати повідомлення. Спробуйте пізніше.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Контакти GoldProduct | телефон, email, форма"
        description="Зв'яжіться з GoldProduct: +380 44 123 45 67, hello@example.com. Замовлення та співпраця — м. Київ, Україна."
        path="/contacts"
      />
      <Header />
      <main className="pt-24">
        <section className="py-24 px-6">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground uppercase tracking-wide mb-4">
                Контакти
              </h1>
              <div className="gold-line w-16 mx-auto mb-6" />
              <p className="font-body text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
                Зв'яжіться з нами для замовлення або співпраці
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact info */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  {contacts.map((contact, index) => (
                    <motion.div
                      key={contact.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex items-start gap-4 p-5 rounded-xl border border-border bg-card/50"
                    >
                      <contact.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" strokeWidth={1.5} />
                      <div>
                        <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-1">{contact.label}</p>
                        {contact.href ? (
                          <a href={contact.href} className="font-body text-sm text-foreground hover:text-primary transition-colors">
                            {contact.value}
                          </a>
                        ) : (
                          <p className="font-body text-sm text-foreground">{contact.value}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Contact form */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="rounded-2xl border border-border bg-card/50 p-6 sm:p-8">
                  <h2 className="font-display text-xl font-bold text-foreground mb-6">Напишіть нам</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="contact-name" className="font-body text-xs uppercase tracking-wider text-muted-foreground">Ім'я *</Label>
                      <Input
                        id="contact-name"
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Ваше ім'я"
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground font-body mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-email" className="font-body text-xs uppercase tracking-wider text-muted-foreground">Email *</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="your@email.com"
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground font-body mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-phone" className="font-body text-xs uppercase tracking-wider text-muted-foreground">Телефон</Label>
                      <Input
                        id="contact-phone"
                        value={form.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="+380 XX XXX XX XX"
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground font-body mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-message" className="font-body text-xs uppercase tracking-wider text-muted-foreground">Повідомлення *</Label>
                      <Textarea
                        id="contact-message"
                        value={form.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        placeholder="Ваше повідомлення..."
                        rows={4}
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground font-body mt-1 resize-none"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-body uppercase tracking-wider gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {isSubmitting ? "Надсилаємо..." : "Надіслати"}
                    </Button>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  );
};

export default ContactsPage;
