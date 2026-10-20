import { wedding } from '../config/wedding'
import { normalizeWhatsapp, whatsappUrl } from '../lib/links'
import { IconArrowUp, IconWhatsapp } from '../components/Icons'
import { Monogram } from '../components/Monogram'
import { Divider, Reveal } from '../components/ui'

/** Closing: the camera rises toward the moon above the wishing tree. */
export function ClosingSection() {
  const contacts = wedding.contacts.map((c) => ({ ...c, number: normalizeWhatsapp(c.whatsapp) })).filter((c) => c.number)
  return (
    <section id="closing" data-scene className="section section--center" aria-labelledby="closing-title">
      <div className="closing" data-ui>
        <Reveal>
          <Monogram size={84} className="closing__monogram" />
        </Reveal>
        <Reveal as="p" className="eyebrow" delay={0.05}>Terima kasih</Reveal>
        <Reveal delay={0.1}>
          <h2 id="closing-title" className="display closing__names">
            {wedding.couple.bride.nickname} <span className="amp">&amp;</span> {wedding.couple.groom.nickname}
          </h2>
        </Reveal>
        <Reveal as="p" className="closing__message" delay={0.16}>{wedding.closing.message}</Reveal>
        <Reveal as="p" className="closing__signature" delay={0.22}>{wedding.closing.signature}</Reveal>
        <Reveal delay={0.26}>
          <Divider />
        </Reveal>
        {contacts.length > 0 && (
          <Reveal className="btn-row btn-row--center" delay={0.3}>
            {contacts.map((c) => (
              <a key={c.name} className="btn btn--ghost btn--sm" href={whatsappUrl(c.number!, `Halo ${c.name}, saya ingin bertanya tentang acara pernikahan ${wedding.couple.displayNames}.`)} target="_blank" rel="noopener noreferrer">
                <IconWhatsapp /> {c.name}
              </a>
            ))}
          </Reveal>
        )}
        <Reveal delay={0.34}>
          <a href="#home" className="btn btn--ghost btn--sm">
            <IconArrowUp /> Kembali ke awal
          </a>
        </Reveal>
        <footer className="credits">
          <p>Musik: {wedding.music.title} — {wedding.music.credit}.</p>
          <p>Semua ilustrasi dan model 3D dibuat khusus untuk undangan ini.</p>
        </footer>
      </div>
    </section>
  )
}
