import SEO from "@/components/SEO";
import JsonLd, { createBreadcrumbSchema } from "@/components/JsonLd";

const sectionClass =
  "text-3xl font-bold text-gray-900 mt-12 mb-6 border-b-2 border-gray-200 pb-2";

const PrivacyPolicy = () => {
  const breadcrumbItems = [
    { name: "Home", url: "https://anytranslator.app/" },
    { name: "Privacy Policy", url: "https://anytranslator.app/privacy-policy" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Privacy Policy"
        description="How AnyTranslator collects, uses, stores, and deletes data."
        keywords="privacy policy, data protection, AnyTranslator, translation app"
        url="/privacy-policy"
        type="article"
        publishedTime="2026-09-02T00:00:00Z"
        modifiedTime="2026-09-02T00:00:00Z"
      />
      <JsonLd data={createBreadcrumbSchema(breadcrumbItems)} />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-12 text-center">
            Privacy Policy
          </h1>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8">
              <p className="text-green-800 font-semibold mb-2">
                <strong>Effective date:</strong> September 2, 2026
              </p>
              <p className="text-green-700">
                <strong>Last updated:</strong> September 2, 2026
              </p>
            </div>

            <p className="text-lg text-gray-800 mb-4">
              Shiny Technology Co., Ltd. ("we," "our," or "us") operates
              AnyTranslator, including the iOS app and this website (the
              "Service"). This policy explains what data the Service processes,
              why it is used, and the choices available to you.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
              <p className="text-blue-900 font-semibold mb-2">
                AnyTranslator does not require or create a user account.
              </p>
              <p className="text-blue-800 mb-0">
                We do not ask for an Apple ID, account password, name, or email
                address to use the app or purchase a subscription. We do not
                sell personal data or use it for advertising tracking.
              </p>
            </div>

            <h2 className={sectionClass}>1. Data We Process</h2>
            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              1.1 Translation and support content
            </h3>
            <p>
              When you choose to use a feature, we process the content required
              to provide it, which may include:
            </p>
            <ul className="list-disc pl-8 mb-6 space-y-2">
              <li>text submitted for translation, chat, pronunciation, or learning help;</li>
              <li>photos and image text submitted for photo translation;</li>
              <li>microphone audio and transcripts submitted for voice translation;</li>
              <li>saved history, favorites, chats, and custom knowledge; and</li>
              <li>support messages and any diagnostic details you choose to send.</li>
            </ul>
            <p>
              Content is sent only when you use the relevant feature. We do not
              use your content to train our own artificial-intelligence models.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              1.2 Installation, security, and device data
            </h3>
            <p>
              The app creates a random installation identifier. We also process
              App Attest or StoreKit app-verification data, public signing keys,
              request identifiers, nonces, timestamps, app version, operating
              system, device type, interface language, and approximate country.
              Hosting providers necessarily receive network information such as
              an IP address. We do not request precise location.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              1.3 Purchases, subscriptions, and usage
            </h3>
            <p>
              Apple processes payment. We receive and store verified StoreKit
              transaction information such as product ID, transaction and
              original transaction IDs, purchase and expiry dates, renewal,
              upgrade, refund or revocation state, offer information, price and
              currency, and Apple's signed transaction data. We do not receive
              your Apple ID, card number, or other payment credentials.
            </p>
            <p>
              We record translation and voice operations, their status, the
              applicable free or subscription period, and usage totals to apply
              quotas, restore purchases across Apple devices, prevent duplicate
              charging, and detect abuse.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              1.4 Analytics, diagnostics, and notifications
            </h3>
            <p>
              We collect feature interactions, language and mode choices, app
              performance, errors, crash reports, and limited device and app
              details through Firebase Analytics and Crashlytics. Push tokens
              and locale are stored when notifications are enabled. Analytics
              events are designed not to include translation text, photos, or
              audio.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              1.5 Website data
            </h3>
            <p>
              Our hosting provider may process standard request logs. If you use
              website support chat, Crisp processes the information you submit
              and technical data needed to operate the chat.
            </p>

            <h2 className={sectionClass}>2. How We Use Data</h2>
            <ul className="list-disc pl-8 mb-6 space-y-2">
              <li>provide text, photo, chat, keyboard, learning, and voice features;</li>
              <li>save and retrieve content selected for history or support;</li>
              <li>verify purchases, restore entitlements, and enforce usage limits;</li>
              <li>authenticate genuine app installations and prevent replay, fraud, and abuse;</li>
              <li>send requested support replies and service notifications;</li>
              <li>diagnose crashes, measure reliability, and improve the Service; and</li>
              <li>comply with law and protect users, the Service, and our rights.</li>
            </ul>

            <h2 className={sectionClass}>3. Service Providers</h2>
            <p>
              We disclose only the data needed for the provider to perform its
              service. Providers may process data in countries outside yours.
            </p>
            <ul className="list-disc pl-8 mb-6 space-y-2">
              <li><strong>Apple:</strong> app distribution, StoreKit purchases, subscription verification, App Attest, and push notifications.</li>
              <li><strong>Cloudflare and Amazon Web Services:</strong> API delivery, hosting, security, and storage.</li>
              <li><strong>OpenRouter and selected AI model providers:</strong> text, chat, image, and learning requests.</li>
              <li><strong>Soniox:</strong> live speech recognition and voice translation processing.</li>
              <li><strong>Google Firebase:</strong> analytics, crash diagnostics, and messaging.</li>
              <li><strong>Crisp and Telegram:</strong> customer-support communication and internal support routing.</li>
            </ul>
            <p>
              We may also disclose data when required by valid legal process or
              when reasonably necessary to prevent fraud, security incidents, or
              harm.
            </p>

            <h2 className={sectionClass}>4. Storage, Retention, and Clear Data</h2>
            <p>
              Some history, favorites, chats, custom knowledge, and settings are
              stored locally on your device. Selected history and support data
              may also be stored by our service and associated with the random
              installation identifier. We retain data only as long as reasonably
              necessary for the purposes described above, security, dispute
              resolution, and legal obligations.
            </p>
            <p>
              The app's <strong>Clear Data</strong> action removes local history,
              favorites, chats, custom knowledge, and cached content, and asks our
              service to remove history and direct support messages for that
              installation. It does not cancel an Apple subscription or erase
              records required for purchase verification, quota enforcement,
              security, anti-abuse, accounting, or legal compliance. A push token
              may remain until notifications are disabled, the token expires, or
              the device is unregistered.
            </p>

            <h2 className={sectionClass}>5. Tracking and Advertising</h2>
            <p>
              AnyTranslator does not display third-party advertising, sell or
              rent personal data, combine app data with third-party data for
              advertising, or track you across apps and websites owned by other
              companies. We use first-party product analytics to understand app
              reliability and feature use.
            </p>

            <h2 className={sectionClass}>6. Your Choices and Rights</h2>
            <ul className="list-disc pl-8 mb-6 space-y-2">
              <li>Use <strong>Clear Data</strong> in the app to remove translation and support content described above.</li>
              <li>Control camera, microphone, photos, and notifications in iOS Settings.</li>
              <li>Manage, cancel, or restore subscriptions through Apple.</li>
              <li>Contact us to request access, correction, deletion, restriction, objection, or portability where applicable.</li>
            </ul>
            <p>
              Because there is no AnyTranslator account, we may need your
              installation identifier and reasonable verification before acting
              on a request. We may retain records when required by law or when an
              applicable exception permits retention.
            </p>

            <h2 className={sectionClass}>7. International Transfers</h2>
            <p>
              The Service and its providers operate internationally. Where
              required, we rely on recognized transfer mechanisms and contractual
              safeguards for cross-border processing.
            </p>

            <h2 className={sectionClass}>8. Security</h2>
            <p>
              We use technical and organizational safeguards appropriate to the
              nature of the data, including encrypted transport, signed requests,
              access controls, and provider monitoring. No system is completely
              secure, so absolute security cannot be guaranteed.
            </p>

            <h2 className={sectionClass}>9. Children</h2>
            <p>
              AnyTranslator does not create child profiles or knowingly request
              names, email addresses, or account credentials from children.
              Children should use the Service with a parent or guardian when
              required by local law. Contact us if you believe a child submitted
              personal data that should be removed.
            </p>

            <h2 className={sectionClass}>10. Changes and Contact</h2>
            <p>
              We may update this policy when the Service or legal requirements
              change. The current version and effective date will remain posted
              here. For privacy questions or requests, email{" "}
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

export default PrivacyPolicy;
