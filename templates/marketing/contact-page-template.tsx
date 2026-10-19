export const ContactPageTemplate = () => (
  <div className="max-w-4xl mx-auto p-8">
    <h1 className="text-3xl font-bold mb-2">Get in touch</h1>
    <p className="opacity-70 mb-6">We would love to hear from you. Fill out the form below.</p>
    <form className="space-y-4">
      <input className="input input-bordered w-full" placeholder="Your name" />
      <input className="input input-bordered w-full" placeholder="Your email" />
      <textarea className="textarea textarea-bordered w-full" placeholder="Message"></textarea>
      <button className="btn btn-primary">Send message</button>
    </form>
  </div>
)
