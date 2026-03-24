import { X } from "lucide-react";

const CONTENT = {
  help: {
    title: "Help Center",
    icon: "❓",
    sections: [
      {
        heading: "Getting Started",
        body: "Create your account using your @cev.ac.in email address. Once registered, you can buy, sell, and explore hostel listings immediately.",
      },
      {
        heading: "How to Sell an Item",
        body: "Go to 'Sell Item' in the sidebar, fill in the item details, upload photos, set a price, and publish. Your listing will appear in the Marketplace instantly.",
      },
      {
        heading: "How to Buy",
        body: "Browse the Marketplace, click an item to view details, and choose Cash on Delivery or online payment. Track your order under 'My Orders'.",
      },
      {
        heading: "Hostel Listings",
        body: "Visit the Hostels section to browse CEV campus hostels. Each listing shows amenities, available rooms, distance from college, and warden contact details.",
      },
      {
        heading: "Still need help?",
        body: "Use the 'Contact Support' button in the sidebar to send a message directly to the admin team. We aim to respond within 24 hours.",
      },
    ],
  },
  safety: {
    title: "Safety Guidelines",
    icon: "🛡️",
    sections: [
      {
        heading: "Meet in Safe Locations",
        body: "Always meet buyers and sellers on campus in public, well-lit areas such as the library, canteen, or main block. Never meet off-campus with strangers.",
      },
      {
        heading: "Verify Before You Pay",
        body: "Inspect items in person before making payment. Do not transfer money in advance to sellers you have not met or verified.",
      },
      {
        heading: "Protect Your Credentials",
        body: "Never share your CEV Connect password, OTPs, or personal financial information with any other user, even if they claim to be an admin.",
      },
      {
        heading: "Report Suspicious Activity",
        body: "If you notice fake listings, harassment, or fraudulent behaviour, use the Report button on any profile or item, or contact support immediately.",
      },
      {
        heading: "Trusted Transactions",
        body: "CEV Connect is exclusively for @cev.ac.in students and staff. Only trade with verified campus members and keep all communication within the platform.",
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    icon: "📋",
    sections: [
      {
        heading: "Eligibility",
        body: "CEV Connect is exclusively available to students, faculty, and staff of CEV Campus with a valid @cev.ac.in email address.",
      },
      {
        heading: "Listings & Content",
        body: "Users are solely responsible for the accuracy, legality, and quality of their listings. Prohibited items include stolen goods, counterfeit products, weapons, drugs, or any illegal material.",
      },
      {
        heading: "Transactions",
        body: "CEV Connect facilitates connections between buyers and sellers but is not a party to any transaction. Users agree to transact honestly and in good faith.",
      },
      {
        heading: "Account Conduct",
        body: "Harassment, spam, fraudulent listings, or misuse of the platform will result in immediate account suspension. The admin team reserves the right to remove any content.",
      },
      {
        heading: "Limitation of Liability",
        body: "CEV Connect is provided on an 'as is' basis. The platform is not liable for any disputes arising from transactions between users.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    icon: "🔒",
    sections: [
      {
        heading: "Information We Collect",
        body: "We collect your name, @cev.ac.in email, profile picture, department, and activity data (listings, orders, chats) to operate the platform.",
      },
      {
        heading: "How We Use Your Data",
        body: "Your data is used solely to provide CEV Connect services — displaying your profile, processing orders, and facilitating communication between users.",
      },
      {
        heading: "Data Sharing",
        body: "We do not sell your data to third parties. Your email is never shown to other users. Only your name, profile photo, and public listings are visible to others.",
      },
      {
        heading: "Data Security",
        body: "Passwords are encrypted using industry-standard bcrypt hashing. All API communication is secured. We take reasonable measures to protect your information.",
      },
      {
        heading: "Your Rights",
        body: "You may update or delete your account at any time by contacting support. Upon deletion, your personal data will be removed from our systems within 30 days.",
      },
    ],
  },
};

function FooterInfoModal({ type, onClose }) {
  if (!type) return null;
  const content = CONTENT[type];
  if (!content) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-6 text-white flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-3xl">{content.icon}</span>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">{content.title}</h2>
                <p className="text-gray-400 text-sm mt-0.5">CEV Campus Connect</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors flex-shrink-0 mt-0.5"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto p-8 space-y-7">
          {content.sections.map((sec, i) => (
            <div key={i}>
              <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-widest mb-2">
                {sec.heading}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">{sec.body}</p>
              {i < content.sections.length - 1 && (
                <div className="mt-7 h-px bg-gray-100" />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-8 py-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default FooterInfoModal;
