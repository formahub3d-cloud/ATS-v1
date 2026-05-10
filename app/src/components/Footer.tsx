// Footer del sito pubblico. I link puntano alle pagine reali create nello
// sprint "completamento landing": /strutture, /lavoratori, /chi-siamo,
// /faq, /contatti, /privacy, /termini, /cookie.

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Instagram, Linkedin, Facebook, Mail } from 'lucide-react'
import { LogoAts } from './icons/LogoAts'

const structureLinks = [
  { label: 'Per le strutture', to: '/strutture' },
  { label: 'Registra struttura', to: '/auth' },
  { label: 'Come funziona', to: '/strutture#come-funziona' },
  { label: 'FAQ', to: '/faq' },
]

const employeeLinks = [
  { label: 'Per i lavoratori', to: '/lavoratori' },
  { label: 'Diventa dipendente', to: '/auth' },
  { label: 'Sistema rank', to: '/lavoratori#rank' },
  { label: 'FAQ', to: '/faq' },
]

const aboutLinks = [
  { label: 'Chi siamo', to: '/chi-siamo' },
  { label: 'Contatti', to: '/contatti' },
  { label: 'FAQ', to: '/faq' },
]

const legalLinks = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Termini di servizio', to: '/termini' },
  { label: 'Cookie Policy', to: '/cookie' },
]

const socialLinks = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Mail, href: 'mailto:info@ats-servizio.it', label: 'Email' },
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

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        to={to}
        className="text-sm text-text-muted hover:text-sky-primary transition-colors duration-250 relative group"
      >
        {children}
        <span className="absolute -bottom-0.5 left-0 w-full h-[1px] bg-sky-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
      </Link>
    </li>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-navy border-t border-[rgba(255,255,255,0.06)]">
      <div className="max-w-[1280px] mx-auto px-6 pt-20 pb-10">
        {/* Top row: 5 columns su desktop (brand + 4 sezioni), 2 su tablet, 1 su mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-10 mb-12">
          {/* Brand column — occupa 2 colonne su desktop wide */}
          <FooterColumn title="" delay={0}>
            <LogoAts className="w-[140px] h-[42px] mb-4" />
            <p className="text-sm text-text-muted mb-4 leading-relaxed">
              Catering HORECA con dipendenti diretti. Operiamo a Benevento e provincia.
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
            <p className="text-[13px] text-text-muted">Made in Benevento</p>
          </FooterColumn>

          {/* Strutture */}
          <FooterColumn title="Strutture" delay={0.1}>
            <ul className="space-y-3">
              {structureLinks.map((link) => (
                <FooterLink key={link.label} to={link.to}>{link.label}</FooterLink>
              ))}
            </ul>
          </FooterColumn>

          {/* Lavoratori */}
          <FooterColumn title="Lavoratori" delay={0.15}>
            <ul className="space-y-3">
              {employeeLinks.map((link) => (
                <FooterLink key={link.label} to={link.to}>{link.label}</FooterLink>
              ))}
            </ul>
          </FooterColumn>

          {/* Azienda */}
          <FooterColumn title="Azienda" delay={0.2}>
            <ul className="space-y-3">
              {aboutLinks.map((link) => (
                <FooterLink key={link.label} to={link.to}>{link.label}</FooterLink>
              ))}
            </ul>
          </FooterColumn>

          {/* Legal */}
          <FooterColumn title="Legal" delay={0.25}>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <FooterLink key={link.label} to={link.to}>{link.label}</FooterLink>
              ))}
            </ul>
          </FooterColumn>
        </div>

        {/* Bottom row */}
        <div className="border-t border-[rgba(255,255,255,0.06)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-text-muted">
            &copy; {year} ATS — Al TuO Servizio. Tutti i diritti riservati.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-success rounded-full animate-status-pulse" />
            <span className="text-[13px] text-success">Sistema operativo</span>
          </div>
          <p className="text-[13px] text-text-muted italic">
            Hospitality fatta bene.
          </p>
        </div>
      </div>
    </footer>
  )
}
