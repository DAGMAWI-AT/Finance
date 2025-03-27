import React from "react";
import "./Contact.css";
// import imgs from "/public/contact-img.15a914b7.png";
const Contact = () => {
  return (
    <>
      <div className="contact_area">
        <div className="d-table">
          <div className="d-table-cell">
            <div className="container">
              <h2>Contact Us</h2>
            </div>
          </div>
        </div>
      </div>
      {/* <div className=""> */}
      <div className="contact-info-area ptb-80 ">
        <div className="container">
          <div className="row flex flex-wrap justify-content-center">
            <div className="col-lg-4 col-md-6 col-sm-6">
              <div className="contact-info-box">
                <div className="icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <h3>Mail Here</h3>
                <p>
                  <a href="mailto:Bishofftu@csos.com">Bishofftu@csos.com</a>
                </p>
                <p>
                  <a href="mailto:info@csos.com">info@csos.com</a>
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-sm-6">
              <div className="contact-info-box">
                <div className="icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <h3>Visit Here</h3>
                <p>Bishoftu, Oromia, Ethiopia </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-sm-6">
              <div className="contact-info-box">
                <div className="icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <h3>Call Here</h3>
                <p>
                  <a href="tel:+251 000 0000">+251 000 0000</a>
                </p>
                <p>
                  <a href="tel:+251 000 0000">+251 000 0000</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="contact-area ptb-80">
        <div className="container">
          <div className="section-title">
            <h2>Get In Touch With Us</h2>
            <div className="bar"></div>
            <p>Anything On your Mind. We’ll Be Glad To Assist You!</p>
          </div>
          <div className="row flex-wrap flex align-items-center">
            <div className="img-container">
              <img
                alt="image"
                loading="lazy"
                width="685"
                height="494"
                decoding="async"
                data-nimg="1"
                style={{ color: "transparent" }}
                src="/contact-img.png"
              />
            </div>
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
              <form className="space-y-6">
                {/* Name Input */}
                <div className="w-full">
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="name"
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Your Name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Email Input */}
                <div className="w-full">
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="email"
                  >
                    Your Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Your Email Address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone Number Input */}
                  <div>
                    <label
                      className="block text-gray-700 text-sm font-medium mb-2"
                      htmlFor="number"
                    >
                      Your Phone Number
                    </label>
                    <input
                      type="tel"
                      name="number"
                      id="number"
                      placeholder="Your Phone Number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Subject Input */}
                  <div>
                    <label
                      className="block text-gray-700 text-sm font-medium mb-2"
                      htmlFor="subject"
                    >
                      Your Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      id="subject"
                      placeholder="Your Subject"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Message Textarea */}
                <div className="w-full">
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="message"
                  >
                    Write Your Message
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    rows="5"
                    placeholder="Write your message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  ></textarea>
                </div>

                {/* Checkbox */}
                <div className="flex items-start">
                  <input
                    id="terms"
                    type="checkbox"
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <label htmlFor="terms" className="ml-3 text-gray-600 text-sm">
                    By checking this, you agree to our{" "}
                    <a
                      href="/terms-conditions"
                      className="text-blue-500 hover:underline"
                    >
                      Terms
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy-policy"
                      className="text-blue-500 hover:underline"
                    >
                      Privacy Policy
                    </a>
                    .
                  </label>
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* </div> */}
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3655.8571860535044!2d38.97399971020746!3d8.74871099126558!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b7320e6e16963%3A0xf65a8cd917f28fd5!2sBishoftu%20City%20Administration!5e1!3m2!1sen!2set!4v1734346050229!5m2!1sen!2set"
        width="100%"
        height="450"
        loading="lazy"
      ></iframe>
    </>
  );
};

export default Contact;
