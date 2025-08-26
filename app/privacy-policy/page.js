// pages/privacy.js
import Head from "next/head";

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | Your App Name</title>
        <meta
          name="description"
          content="Privacy Policy for Your App Name. Learn how we collect and use your information when you use our app and Facebook API."
        />
      </Head>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

        <p className="mb-4">
          Effective Date: [Insert Date]
        </p>

        <p className="mb-4">
          [Your App Name] (“we”, “our”, or “us”) respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and share information when you use our app, including through Facebook API integrations.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">Information We Collect</h2>
        <ul className="list-disc list-inside mb-4">
          <li><strong>Personal Information:</strong> Name, email address, Facebook ID, and other information you provide when logging in with Facebook.</li>
          <li><strong>Usage Data:</strong> Data about how you use the app, including logins, clicks, and interactions.</li>
          <li><strong>Ads Data:</strong> For users who grant permissions like <code>ads_read</code>, we may access ad performance data for ad accounts you own or manage.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3">How We Use Your Information</h2>
        <ul className="list-disc list-inside mb-4">
          <li>Provide, maintain, and improve our app and services.</li>
          <li>Display ad performance data in the app.</li>
          <li>Communicate with you regarding your account and app updates.</li>
          <li>Ensure compliance with legal obligations.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3">Data Sharing</h2>
        <p className="mb-4">
          We do not sell your personal information. We may share data with:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>Facebook, when you use Facebook Login or grant permissions.</li>
          <li>Service providers who help us operate the app.</li>
          <li>Law enforcement or legal entities as required by law.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3">Your Choices</h2>
        <p className="mb-4">
          You can control the data shared with us by adjusting your Facebook privacy settings or revoking app permissions at any time.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">Contact Us</h2>
        <p className="mb-4">
          If you have questions about this Privacy Policy, please contact us at: [your email].
        </p>
      </main>
    </>
  );
}
