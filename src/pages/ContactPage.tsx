import { useState } from "react";
import { motion } from "framer-motion";
import PublicNav from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle } from "lucide-react";

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (response.ok) {
        setIsSubmitted(true);
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "0.875rem 1rem",
    background: "#1e293b", border: "2px solid #334155",
    borderRadius: "14px", fontSize: "0.95rem", color: "#e2e8f0",
    outline: "none", fontFamily: "inherit", transition: "border-color 0.3s",
    boxSizing: "border-box" as const
  };

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "#e2e8f0" }}>
      <PublicNav />

      {/* Hero */}
      <section style={{
        paddingTop: "120px", paddingBottom: "40px",
        background: "linear-gradient(135deg, #0f172a, #1e1b4b, #0f172a)",
        textAlign: "center"
      }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          style={{ maxWidth: "600px", margin: "0 auto", padding: "0 1.5rem" }}>
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800,
            background: "linear-gradient(135deg, #f8fafc, #cbd5e1)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: "1rem"
          }}>Contact Us</h1>
          <p style={{ color: "#94a3b8", fontSize: "1.05rem", lineHeight: 1.7 }}>
            Have a question or need assistance? We'd love to hear from you.
          </p>
        </motion.div>
      </section>

      {/* Content */}
      <section style={{ padding: "40px 1.5rem 80px" }}>
        <div style={{
          maxWidth: "1100px", margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "3rem"
        }}>
          {/* Contact Info */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "1.5rem" }}>Get in Touch</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {[
                { icon: Mail, label: "Email", value: "info@trespics.com", color: "#3b82f6" },
                { icon: Phone, label: "Phone", value: "+254 700 000 000", color: "#8b5cf6" },
                { icon: MapPin, label: "Address", value: "Nairobi, Kenya", color: "#10b981" },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "1rem",
                  background: "rgba(30,41,59,0.5)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "16px", padding: "1.25rem 1.5rem"
                }}>
                  <div style={{
                    width: "44px", height: "44px", borderRadius: "12px",
                    background: `${item.color}20`, display: "flex", alignItems: "center",
                    justifyContent: "center", color: item.color, flexShrink: 0
                  }}>
                    <item.icon size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", fontWeight: 600 }}>
                      {item.label}
                    </div>
                    <div style={{ color: "#e2e8f0", fontWeight: 500 }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: "2rem", background: "rgba(30,41,59,0.5)",
              border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px",
              padding: "1.5rem", fontSize: "0.9rem", color: "#94a3b8", lineHeight: 1.6
            }}>
              <strong style={{ color: "#f1f5f9" }}>Office Hours:</strong><br />
              Monday - Friday: 8:00 AM - 5:00 PM<br />
              Saturday: 9:00 AM - 1:00 PM<br />
              Sunday: Closed
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <div style={{
              background: "rgba(30, 41, 59, 0.7)", backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "24px", padding: "2.5rem"
            }}>
              {isSubmitted ? (
                <div style={{ textAlign: "center", padding: "2rem 0" }}>
                  <CheckCircle size={64} color="#10b981" style={{ margin: "0 auto 1.5rem" }} />
                  <h3 style={{ color: "#f1f5f9", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                    Message Sent!
                  </h3>
                  <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
                    Thank you for reaching out. We'll get back to you soon.
                  </p>
                  <button onClick={() => { setIsSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                    style={{
                      padding: "0.75rem 1.5rem", background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                      color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: 600
                    }}>Send Another Message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "0.25rem" }}>Send us a Message</h2>
                  <div>
                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "#94a3b8", marginBottom: "0.5rem" }}>Full Name</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" required style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "#94a3b8", marginBottom: "0.5rem" }}>Email</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" required style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "#94a3b8", marginBottom: "0.5rem" }}>Subject</label>
                    <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Subject" required style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "#94a3b8", marginBottom: "0.5rem" }}>Message</label>
                    <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Your message..." required
                      style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }} />
                  </div>
                  <button type="submit" disabled={isSubmitting} style={{
                    width: "100%", padding: "0.9rem",
                    background: isSubmitting ? "#475569" : "linear-gradient(135deg, #3b82f6, #6366f1)",
                    color: "white", border: "none", borderRadius: "14px", fontSize: "0.95rem",
                    fontWeight: 600, cursor: isSubmitting ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 15px rgba(59,130,246,0.3)", marginTop: "0.5rem",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
                  }}>
                    {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : <><Send size={18} /> Send Message</>}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
