/* ============================================================================
 * SITE CONFIG — the control panel for the whole website.
 *
 * Almost every piece of "chrome" (brand name, nav, contact details, footer)
 * and the entire structure of the home page live in this one file.
 *
 * You do not need to touch any component to restructure the site:
 *   - Change text .................. edit the strings below
 *   - Remove a home page section ... delete its line from HOME_SECTIONS
 *   - Reorder the home page ........ drag its line up or down in HOME_SECTIONS
 *   - Add a nav link ............... add an entry to NAV
 * ========================================================================== */

/* ---------------------------------------------------------------------------
 * 1. BRAND + CONTACT
 * ------------------------------------------------------------------------ */

export const SITE = {
  /** Shown in the header, the browser tab, and the footer. */
  name: 'JIMBO',
  /** Sits under the logo in the footer, and after the page title in the tab. */
  tagline: '3D visualisation for the construction industry',
  /** One-line description used for SEO and social sharing previews. */
  description:
    'Animation and still imagery that helps construction manufacturers show ' +
    'how their products are installed, sequenced and specified.',

  /**
   * Your live domain, with no trailing slash. Used to build absolute URLs for
   * the sitemap and social share cards. Update this before you go live.
   */
  url: 'https://example.com',

  /**
   * Hosting the site in a SUBFOLDER (e.g. example.com/portfolio)?
   * Set this to '/portfolio'. Leave as '/' for a normal root domain.
   */
  base: '/',
} as const;

export const CONTACT = {
  email: 'hello@example.com',
  phone: '+44 (0)20 7946 0000',
  location: 'Manchester, United Kingdom',

  /**
   * Static hosting cannot process a form on its own, so the contact form
   * needs a third-party endpoint (Formspree, Basin, Netlify Forms, etc.).
   *
   *   null  -> the page shows your email + phone as plain links (no form)
   *   'https://formspree.io/f/xxxxxxx' -> a working form is rendered
   */
  formEndpoint: null as string | null,
};

/** Footer social links. Delete any line you do not use. */
export const SOCIAL = [
  { label: 'LinkedIn', href: 'https://linkedin.com/company/example' },
  { label: 'Vimeo', href: 'https://vimeo.com/example' },
  { label: 'Instagram', href: 'https://instagram.com/example' },
];

/* ---------------------------------------------------------------------------
 * 2. NAVIGATION
 *
 * These links always appear. Any Markdown file in `src/content/pages/` with
 * `nav: true` in its frontmatter is added automatically, so you rarely need
 * to edit this list by hand.
 * ------------------------------------------------------------------------ */

export const NAV = [
  { label: 'Work', href: '/work/', order: 0 },
  { label: 'Contact', href: '/contact/', order: 100 },
];

/** Text and destination of the button on the far right of the header. */
export const HEADER_CTA = { label: 'Start a project', href: '/contact/' };

/* ---------------------------------------------------------------------------
 * 3. HOME PAGE STRUCTURE
 *
 * The home page is assembled from this array, top to bottom.
 *
 *   - DELETE a block to remove that section from the page.
 *   - MOVE a block to reorder the page.
 *   - COPY a block to use the same section twice with different content.
 *
 * The `type` of each block decides which component renders it. The available
 * types are: 'hero' | 'featured' | 'stats' | 'capabilities' | 'process'
 *            | 'clients' | 'cta'
 * ------------------------------------------------------------------------ */

export const HOME_SECTIONS: HomeSection[] = [
  {
    type: 'hero',
    eyebrow: '3D animation & visualisation',
    title: 'Show how it is built, before it is built.',
    body:
      'We make animations and stills that explain construction products to ' +
      'the people who specify, buy and install them — clearly enough to ' +
      'shorten a sales conversation.',
    primaryCta: { label: 'See the work', href: '/work/' },
    secondaryCta: { label: 'Talk to us', href: '/contact/' },
    /* Background media for the hero. Use a video for movement, or leave
       `video` out and the poster image is shown on its own. */
    poster: '/media/hero-poster.jpg',
    video: '/media/hero.mp4',
  },

  {
    type: 'featured',
    title: 'Selected work',
    intro: 'Installation sequences, product cutaways and site-context imagery.',
    /* How many projects to show. They are chosen from the projects marked
       `featured: true`, in their `order` sequence. */
    limit: 4,
    cta: { label: 'View all work', href: '/work/' },
  },

  {
    type: 'stats',
    items: [
      { value: '12+', label: 'Years in construction visualisation' },
      { value: '400+', label: 'Products modelled and animated' },
      { value: '30+', label: 'Manufacturers and contractors served' },
    ],
  },

  {
    type: 'capabilities',
    title: 'What we make',
    intro:
      'Every asset is built from one accurate 3D model, so your animation, ' +
      'renders and technical diagrams always agree with each other.',
    /* The cards come from the Markdown files in `src/content/capabilities/`. */
  },

  {
    type: 'process',
    title: 'How a project runs',
    intro: 'Four stages, fixed price, no surprises at the end.',
    steps: [
      {
        title: 'Technical review',
        body: 'We work from your CAD, Revit or IFC files, or from drawings and a sample if the model does not exist yet.',
      },
      {
        title: 'Modelling',
        body: 'One accurate master model is built and checked against your specification and tolerances.',
      },
      {
        title: 'Animatic',
        body: 'You approve a rough sequence with timings and camera moves before we spend anything on rendering.',
      },
      {
        title: 'Delivery',
        body: 'Final animation, stills and cutaways, exported for web, trade stands and print.',
      },
    ],
  },

  {
    type: 'clients',
    title: 'Trusted by',
    /* Plain text names keep this simple. Swap in logo files whenever you have
       permission to use them. */
    items: [
      'Halloran Precast',
      'Northbank Facades',
      'Verity Roofing Systems',
      'Cawley Groundworks',
      'Ilex Structural',
      'Marden Cladding',
    ],
  },

  {
    type: 'cta',
    title: 'Got a product that is hard to explain?',
    body: 'Send us a drawing and we will tell you what it would take to show it properly.',
    button: { label: 'Start a project', href: '/contact/' },
  },
];

/* ---------------------------------------------------------------------------
 * 4. WORK PAGE FILTERS
 *
 * The buttons across the top of /work/. The `value` must match the `type`
 * field used in a project's frontmatter ('all' is a special case).
 * ------------------------------------------------------------------------ */

export const WORK_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Animation', value: 'animation' },
  { label: 'Stills', value: 'stills' },
  { label: 'Technical', value: 'technical' },
];

/* ---------------------------------------------------------------------------
 * Types — you should not need to edit anything below this line.
 * ------------------------------------------------------------------------ */

export type Link = { label: string; href: string };

export type HomeSection =
  | {
      type: 'hero';
      eyebrow?: string;
      title: string;
      body?: string;
      primaryCta?: Link;
      secondaryCta?: Link;
      poster?: string;
      video?: string;
    }
  | { type: 'featured'; title: string; intro?: string; limit?: number; cta?: Link }
  | { type: 'stats'; title?: string; items: { value: string; label: string }[] }
  | { type: 'capabilities'; title: string; intro?: string }
  | {
      type: 'process';
      title: string;
      intro?: string;
      steps: { title: string; body: string }[];
    }
  | { type: 'clients'; title: string; items: string[] }
  | { type: 'cta'; title: string; body?: string; button: Link };
