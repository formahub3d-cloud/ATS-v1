import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Instagram, Linkedin, Facebook, Phone } from 'lucide-react'
import { LogoAts } from './icons/LogoAts'

const structureLinks = [
  { label: 'Come funziona', href: '/#how-it-works' },
  { label: 'Prezzi', href: '/#pricing' },
  { label: 'Registra struttura', href: '/auth' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'Supporto', href: '/#contact' },
]

const employeeLinks = [
  { label: 'Diventa dipendente', href: '/auth' },
  { label: 'Sistema rank', href: '/#rank' },
  { label: 'Requisiti', href: '/#faq' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'App mobile', href: '/employee' },
]

const socialLinks = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Phone, href: '#', label: 'WhatsApp' },
]

function FooterColumn({ title, children, delay }: { title: string; children: React.ReactNode; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
    >
      {title && <h4 className="text-sm font-semibold text-text-primary mb-4">{title}</h4>}
      {children}
    </motion.div>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        to={href}
        className="text-sm text-text-muted hover:text-sky-primary transition-colors duration-250 relative group"
      >
        {children}
        <span className="absolute -bottom-0.5 left-0 w-full h-[1px] bg-sky-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
      </Link>
    </li>
  )
}

export default function Footer() {
  return (
    <footer className="bg-navy border-t border-[rgba(255,255,255,0.06)]">
      <div className="max-w-[1280px] mx-auto px-6 pt-20 pb-10">
        {/* Top row - 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-12 mb-12">
          {/* Brand column */}
          <FooterColumn title="" delay={0}>
            <LogoAts className="w-[140px] h-[42px] mb-4" />
            <p className="text-sm text-text-muted mb-4 leading-relaxed">
              Piattaforma di intermediazione hospitality per il territorio di Benevento e provincia.
            </p>
            <div className="flex items-center gap-3 mb-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="text-text-muted hover:text-sky-primary hover:scale-[1.2] transition-all duration-200"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <p className="text-[13px] text-text-muted">Made in Benevento — 2026</p>
          </FooterColumn>

          {/* Structure links */}
          <FooterColumn title="Per le strutture" delay={0.1}>
            <ul className="space-y-3">
              {structureLinks.map((link) => (
                <FooterLink key={link.label} href={link.href}>
                  {link.label}
                </FooterLink>
              ))}
            </ul>
          </FooterColumn>

          {/* Employee links */}
          <FooterColumn title="Per i dipendenti" delay={0.2}>
            <ul className="space-y-3">
              {employeeLinks.map((link) => (
                <FooterLink key={link.label} href={link.href}>
                  {link.label}
                </FooterLink>
              ))}
            </ul>
          </FooterColumn>

          {/* Contact */}
          <FooterColumn title="Contatti & Legal" delay={0.3}>
            <ul className="space-y-3 text-sm text-text-muted">
              <li>Benevento, Italia</li>
              <li>info@ats-servizio.it</li>
              <li>+39 0824 XXX XXX</li>
            </ul>
            <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
              <div className="flex flex-wrap gap-x-3 text-[13px] text-text-muted">
                <a href="#" className="hover:text-sky-primary transition-colors">Privacy Policy</a>
                <span>·</span>
                <a href="#" className="hover:text-sky-primary transition-colors">Termini di servizio</a>
                <span>·</span>
                <a href="#" className="hover:text-sky-primary transition-colors">Cookie Policy</a>
              </div>
            </div>
          </FooterColumn>
        </div>

        {/* Bottom row */}
        <div className="border-t border-[rgba(255,255,255,0.06)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-text-muted">
            &copy; 2026 ATS — Al TuO Servizio. Tutti i diritti riservati.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-success rounded-full animate-status-pulse" />
            <span className="text-[13px] text-success">Sistema operativo</span>
          </div>
          <p className="text-[13px] text-text-muted italic">
            Crafted with precision for the hospitality industry
          </p>
        </div>
      </div>
    </footer>
  )
}
