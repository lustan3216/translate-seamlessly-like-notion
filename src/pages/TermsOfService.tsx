import SEO from "@/components/SEO";
import JsonLd, { createBreadcrumbSchema } from "@/components/JsonLd";

const sectionClass =
  "text-3xl font-bold text-gray-900 mt-12 mb-6 border-b-2 border-gray-200 pb-2";

const TermsOfService = () => {
  const breadcrumbItems = [
    { name: "Home", url: "https://anytranslator.app/" },
    { name: "Terms of Service", url: "https://anytranslator.app/terms-of-service" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Terms of Service"
        description="Terms for using AnyTranslator and its Apple subscriptions."
        keywords="terms of service, AnyTranslator, subscription, translation app"
        url="/terms-of-service"
        type="article"
        publishedTime="2026-09-02T00:00:00Z"
        modifiedTime="2026-09-02T00:00:00Z"
      />
      <JsonLd data={createBreadcrumbSchema(breadcrumbItems)} />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-12 text-center">
            Terms of Service
          </h1>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
              <p className="text-blue-800 font-semibold mb-2">
                <strong>Effective date:</strong> September 2, 2026
              </p>
              <p className="text-blue-700">
                <strong>Last updated:</strong> September 2, 2026
              </p>
            </div>

            <p className="text-lg text-gray-800 mb-4">
              These Terms govern your use of the AnyTranslator iOS application,
              website, and related services (the "Service") operated by Shiny
              Technology Co., Ltd. ("we," "our," or "us"). By using the Service,
              you agree to these Terms and our Privacy Policy.
            </p>

            <h2 className={sectionClass}>1. The Service</h2>
            <p>
              AnyTranslator provides AI-assisted text, photo, chat, keyboard,
              learning, pronunciation, and voice translation features. Features
              may vary by device, language, region, app version, subscription,
              network availability, and provider availability.
            </p>
            <p>
              AnyTranslator does not require or create a user account. The app
              uses a random installation identifier for security, saved data,
              support, and free usage. Apple StoreKit transactions are used to
              verify subscriptions; they are not an AnyTranslator login.
            </p>

            <h2 className={sectionClass}>2. Free Use and Subscriptions</h2>
            <p>
              Free features may have usage limits. Paid Standard and Voice plans
              are offered as weekly, monthly, or annual auto-renewable
              subscriptions. Current prices, included features, voice minutes,
              usage limits, and billing periods are shown in the app before
              purchase and form part of these Terms.
            </p>
            <ul className="list-disc pl-8 mb-6 space-y-2">
              <li>Payment is charged to your Apple Account when the purchase is confirmed.</li>
              <li>The subscription renews automatically unless canceled at least 24 hours before the current period ends.</li>
              <li>Your Apple Account is charged for renewal within 24 hours before the current period ends.</li>
              <li>You can manage or cancel a subscription in your App Store account settings.</li>
              <li>Purchases, restores, upgrades, downgrades, refunds, revocations, and billing are governed by Apple and the applicable App Store terms.</li>
            </ul>
            <p>
              Restoring purchases on another compatible Apple device can restore
              the verified subscription and its current-period usage. Local
              history, chats, favorites, support conversations, custom knowledge,
              and settings do not sync between devices.
            </p>

            <h2 className={sectionClass}>3. Usage Limits</h2>
            <p>
              Free usage is associated with an installation. Subscription usage
              is associated with the verified Apple subscription period and may
              be shared across devices that restore the same subscription. Usage
              counters reset only as described in the app and verified by the
              Service. Attempts to bypass limits, replay requests, automate abuse,
              or manipulate purchase data are prohibited.
            </p>

            <h2 className={sectionClass}>4. Your Content and AI Providers</h2>
            <p>
              You retain ownership of content you submit. You grant us and our
              service providers a limited right to transmit, process, and store
              that content only as needed to operate, secure, support, and improve
              the Service as described in the Privacy Policy.
            </p>
            <p>
              Do not submit content you lack the right to use or highly sensitive
              information unless necessary. Translation requests may be processed
              by third-party AI and speech providers. We do not use your content
              to train our own AI models.
            </p>

            <h2 className={sectionClass}>5. Translation Accuracy</h2>
            <p>
              AI translations, speech recognition, summaries, explanations, and
              suggestions can be incomplete, inaccurate, or inappropriate for the
              context. Review results before relying on them. The Service is not a
              substitute for a qualified human translator or professional legal,
              medical, financial, safety, or emergency advice.
            </p>

            <h2 className={sectionClass}>6. Acceptable Use</h2>
            <p>You must not:</p>
            <ul className="list-disc pl-8 mb-6 space-y-2">
              <li>violate law or another person's rights;</li>
              <li>submit unlawful, harmful, infringing, or malicious content;</li>
              <li>interfere with, probe, reverse engineer, or gain unauthorized access to the Service except where law expressly permits;</li>
              <li>circumvent subscriptions, quotas, authentication, security, or abuse controls;</li>
              <li>resell or automate the Service without written permission; or</li>
              <li>use the Service to create malware, fraud, harassment, or other harm.</li>
            </ul>

            <h2 className={sectionClass}>7. Clear Data and Ending Use</h2>
            <p>
              You may stop using the Service at any time. The app's Clear Data
              action removes the translation and support content described in our
              Privacy Policy. Clear Data and deleting the app do not cancel an
              Apple subscription; subscriptions must be managed through Apple.
              Purchase, quota, fraud-prevention, security, and legally required
              records may be retained.
            </p>
            <p>
              We may suspend or limit access when reasonably necessary to protect
              the Service, enforce these Terms, comply with law, or address fraud,
              abuse, or security risk.
            </p>

            <h2 className={sectionClass}>8. Intellectual Property</h2>
            <p>
              The Service, software, design, branding, and our original content
              are owned by Shiny Technology Co., Ltd. or its licensors. Subject
              to these Terms, we grant you a limited, personal, non-exclusive,
              non-transferable, revocable license to use the Service.
            </p>

            <h2 className={sectionClass}>9. Availability and Changes</h2>
            <p>
              We may modify, suspend, or discontinue features and may update
              usage limits when reasonably necessary. We do not guarantee that
              every provider, language, feature, or network path will always be
              available. Material changes affecting paid service will be handled
              consistently with applicable law and App Store requirements.
            </p>

            <h2 className={sectionClass}>10. Disclaimers and Liability</h2>
            <p>
              To the maximum extent permitted by law, the Service is provided
              "as is" and "as available" without warranties of uninterrupted
              availability, accuracy, fitness for a particular purpose, or
              non-infringement.
            </p>
            <p>
              To the maximum extent permitted by law, we are not liable for
              indirect, incidental, special, consequential, or punitive damages,
              loss of data, profits, or opportunities arising from the Service.
              Nothing in these Terms excludes rights or liability that cannot be
              excluded under applicable consumer law.
            </p>

            <h2 className={sectionClass}>11. Apple Terms</h2>
            <p>
              Apple is not responsible for operating or supporting the Service.
              Your use of the app is also subject to applicable Apple Media
              Services Terms and the Apple Standard Licensed Application End User
              License Agreement where it applies.
            </p>

            <h2 className={sectionClass}>12. Changes and Contact</h2>
            <p>
              We may update these Terms by posting a revised version and effective
              date. Continued use after the effective date means you accept the
              revised Terms. For questions, email{" "}
              <a href="mailto:support@anytranslator.app">
                support@anytranslator.app
              </a>.
            </p>

            <div className="text-center py-8 mt-12 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                © 2026 Shiny Technology Co., Ltd. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
