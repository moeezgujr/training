export default function CookiePolicy() {
  return (
    <div className="relative min-h-screen w-full">
      {/* Container for the content - ensures vertical and horizontal centering */}
      <section className="relative z-10 py-12 md:py-20 px-4">
        <div className="container max-w-4xl mx-auto bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-12 shadow-2xl border border-white/10">
          
          <h1 className="text-4xl md:text-5xl font-bold mb-12 text-center tracking-tight text-white">
            Cookie Policy
          </h1>

          <div className="prose prose-lg dark:prose-invert mx-auto text-slate-200">
            <p className="lead text-xl mb-8 text-center italic opacity-90">
              This Cookie Policy explains how Meeting Matters LMS ("we", "us", or "our") uses cookies and similar technologies to recognize you when you visit our website.
            </p>

            <div className="space-y-10 text-justify">
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white border-b border-white/10 pb-2">What Are Cookies?</h2>
                <p>
                  Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work efficiently and to provide reporting information.
                </p>
                <p className="mt-4">
                  Cookies set by the website owner are called "first-party cookies." Cookies set by parties other than the website owner are called "third-party cookies."
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white border-b border-white/10 pb-2">Why Do We Use Cookies?</h2>
                <p>
                  We use cookies for several reasons. Some are required for technical reasons for our platform to operate ("essential" cookies). Others enable us to track and target the interests of our users to enhance the experience.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white border-b border-white/10 pb-2">Specific Cookie Information</h2>
                <div className="overflow-x-auto mt-6 rounded-lg border border-white/20">
                  <table className="min-w-full divide-y divide-white/20 bg-black/20">
                    <thead>
                      <tr className="bg-white/10">
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-white">Cookie Name</th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-white">Type</th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-white">Purpose</th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-white">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {[
                        { name: "mm_session", type: "Essential", purpose: "Maintains active session", dur: "Session" },
                        { name: "mm_auth", type: "Essential", purpose: "Auth details", dur: "30 days" },
                        { name: "mm_preferences", type: "Functionality", purpose: "User preferences", dur: "1 year" },
                        { name: "mm_progress", type: "Functionality", purpose: "Tracks progress", dur: "1 year" },
                        { name: "_ga", type: "Analytics", purpose: "Google Analytics", dur: "2 years" },
                        { name: "_gid", type: "Analytics", purpose: "Google Analytics", dur: "24 hours" },
                      ].map((cookie, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-sm font-mono text-blue-300">{cookie.name}</td>
                          <td className="px-6 py-4 text-sm">{cookie.type}</td>
                          <td className="px-6 py-4 text-sm">{cookie.purpose}</td>
                          <td className="px-6 py-4 text-sm">{cookie.dur}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="bg-white/5 p-8 rounded-xl border border-white/10">
                <h2 className="text-2xl font-semibold mb-4 text-white">Contact Us</h2>
                <p className="mb-4">If you have any questions about our use of cookies, please contact us at:</p>
                <div className="not-italic text-blue-200 space-y-1">
                  <p className="font-bold text-white">Meeting Matters LMS</p>
                  <p>Email: privacy@meetingmatters.com</p>
                  <p>Address: 123 Learning Avenue, Suite 456, Education City, CA 90000</p>
                </div>
              </section>
            </div>

            <p className="text-sm text-slate-400 mt-12 text-center border-t border-white/10 pt-6">
              Last Updated: May 20, 2025
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}