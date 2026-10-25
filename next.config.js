/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // the site was reviewed at /vneo before it became the site: those links land on its pages
  async redirects() {
    return [
      { source: '/vneo', destination: '/', permanent: true },
      { source: '/vneo/:path*', destination: '/:path*', permanent: true },
      // a topic taken off the site
      { source: '/topics/local-first-software', destination: '/topics', permanent: true },
      // projects taken off the site whose write-ups stay
      ...[
        ['basira-retinal-screening', 'designing-a-council-of-models-for-retinal-screening'],
        ['evoid-applied-vision-venture', 'what-a-small-vision-venture-taught-me-about-scope'],
        ['imagen-raw-to-edit-dataset-pipeline', 'why-color-science-comes-before-the-model'],
        ['water-shooting-robot', 'a-first-mechatronic-loop-without-a-pump'],
      ].map(([p, w]) => ({ source: `/projects/${p}`, destination: `/writing/${w}`, permanent: true })),
      // projects and write-ups taken off the site
      ...[
        'multilingual-medical-prescription-ocr',
        'lebanese-motorcycle-theory-trainer',
        'local-first-ai-support-triage',
        'ree-personal-finance-tracker',
        'juno',
        'hantawatch-outbreak-dashboard',
        'lumiscan-lesion-dashboard',
        'daleel-lebanese-election-information',
        'runway-inspection-uav',
      ].map((p) => ({ source: `/projects/${p}`, destination: '/projects', permanent: true })),
      ...[
        'extracting-medicine-names-from-multilingual-prescriptions',
        'building-an-adaptive-motorcycle-theory-trainer-for-lebanon',
        'building-a-local-first-ai-support-triage-council',
        'designing-an-offline-first-personal-finance-desktop-app',
        'rebuilding-my-finance-app-around-local-first-sync',
        'building-an-outbreak-dashboard-from-public-sources',
        'making-tenant-isolation-the-only-path',
        'designing-election-information-for-verifiability',
      ].map((w) => ({ source: `/writing/${w}`, destination: '/writing', permanent: true })),
    ]
  },
}

module.exports = nextConfig
