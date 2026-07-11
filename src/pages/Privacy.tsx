import Layout from "@/components/Layout";
import SEO from "@/components/SEO";

export default function Privacy() {
  return (
    <Layout>
      <SEO
        title="Privacy Policy · Lockede"
        description="How Lockede handles data, cookies, generated short links, and third-party ads."
      />
      <section className="container max-w-3xl py-12 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Legal
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="mt-10 space-y-8 text-[15px] leading-7">
          <section>
            <h2 className="text-xl font-semibold">Data we collect</h2>
            <p className="mt-2">
              Lockede is designed to collect as little personal data as
              possible. When you create a short link, we store the destination
              URL, the generated slug, and a click counter. We do not require
              you to sign up or provide personal information.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Cookies and analytics</h2>
            <p className="mt-2">
              We use minimal analytics to understand which posts are being
              read. We do not build advertising profiles. You can clear
              cookies and local storage at any time from your browser
              settings.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Short links you create</h2>
            <p className="mt-2">
              You are responsible for the destinations you shorten. Do not
              use Lockede to shorten links to malware, illegal content, or
              anything that violates third-party rights. Links found to
              break these rules may be disabled without notice.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Third-party ads</h2>
            <p className="mt-2">
              Bridge pages between a short link and its destination may
              display advertising from partners such as Clickadu. Those
              partners have their own privacy practices. Review their
              policies if you interact with an ad.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Contact</h2>
            <p className="mt-2">
              For privacy questions, use the Contact page and we will
              respond as soon as we can.
            </p>
          </section>
        </div>
      </section>
    </Layout>
  );
}
