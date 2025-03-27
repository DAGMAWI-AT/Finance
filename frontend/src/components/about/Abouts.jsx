import React from "react";
import "./About.css";

const Abouts = () => {
  return (
    <>
      <div class="page-title-area p-20">
        <div class="d-table">
          <div class="d-table-cell">
            <div class="container">
              <h2>About Us</h2>
            </div>
          </div>
        </div>
        <div class="shape1">
          <img
            alt="shape"
            loading="lazy"
            width="202"
            height="202"
            decoding="async"
            data-nimg="1"
            src="/shape1.png"
            style={{ color: "transparent" }}
          />
        </div>
        <div class="shape2 rotateme">
          <img
            alt="shape"
            loading="lazy"
            width="22"
            height="22"
            decoding="async"
            data-nimg="1"
            src="/shape2.svg"
            style={{ color: "transparent" }}
          />
        </div>
        <div class="shape3">
          <img
            alt="shape"
            loading="lazy"
            width="28"
            height="28"
            decoding="async"
            data-nimg="1"
            src="/shape3.svg"
            style={{ color: "transparent" }}
          />
        </div>
        <div class="shape4">
          <img
            alt="shape"
            loading="lazy"
            width="21"
            height="20"
            decoding="async"
            data-nimg="1"
            src="/shape4.svg"
            style={{ color: "transparent" }}
          />
        </div>
        <div class="shape5">
          <img
            alt="shape"
            loading="lazy"
            width="182"
            height="146"
            decoding="async"
            data-nimg="1"
            src="/shape5.png"
            style={{ color: "transparent" }}
          />
        </div>
        <div class="shape6 rotateme">
          <img
            alt="shape"
            loading="lazy"
            width="21"
            height="20"
            decoding="async"
            data-nimg="1"
            src="/shape4.svg"
            style={{ color: "transparent" }}
          />
        </div>
        <div class="shape7">
          <img
            alt="shape"
            loading="lazy"
            width="21"
            height="20"
            decoding="async"
            data-nimg="1"
            src="/shape4.svg"
            style={{ color: "transparent" }}
          />
        </div>
        <div class="shape8 rotateme">
          <img
            alt="shape"
            loading="lazy"
            width="22"
            height="22"
            decoding="async"
            data-nimg="1"
            src="/shape2.svg"
            style={{ color: "transparent" }}
          />
        </div>
      </div>
      <div class="about-area pt-2 pb-20">
        <div class="container mx-auto">
          <div class="flex flex-wrap items-center">
            <div class="lg:w-1/2 w-full">
              <div class="about-image p-20">
                <img
                  alt="image"
                  loading="lazy"
                  class="max-w-full h-auto"
                  src="/contact-img.png"
                />
              </div>
            </div>
            <div class="lg:w-1/2 w-full mt-6 lg:mt-0">
              <div class="about-content">
                <div class="section-title">
                  <h2 class="text-2xl font-bold mb-4">About Us</h2>
                  <div class="bar"></div>
                  {/* <div class="w-12 h-1 bg-gray-800 mb-4"></div> */}
                  <p class=" mb-4">
                    Lorem ipsum dolor sit amet, con se ctetur adipiscing elit.
                    In sagittis eg esta ante, sed viverra nunc tinci dunt nec
                    elei fend et tiram.
                  </p>
                </div>
                <p class="text-gray-600 mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. In
                  sagittis egestas ante, sed viverra nunc tincidunt nec nteger
                  nonsed condimntum elit, sit amet feugiat lorem. Proin tempus
                  sagittis velit vitae scelerisque.
                </p>
                <p class="text-gray-600 mb-4">
                  Lorem ipsum dolor sit amet, con se ctetur adipiscing elit. In
                  sagittis eg esta ante, sed viverra nunc tinci dunt nec elei
                  fend et tiram.
                </p>
                <p class="text-gray-600">
                  Business-to-business metrics analytics value proposition
                  funding angel investor entrepreneur alpha ramen equity
                  gamification. Social proof partner network research.
                </p>
              </div>
            </div>
          </div>

          <div class="about-inner-area mt-10">
            <div class="flex flex-wrap justify-center">
              <div class="lg:w-1/3 md:w-1/2 w-full p-4">
                <div class="about-text bg-gray-100 p-6 rounded-lg shadow">
                  <h3 class="text-xl font-semibold mb-4">Our History</h3>
                  <p class="text-gray-600">
                    Lorem ipsum dolor sit amet, con se ctetur adipiscing elit.
                    In sagittis eg esta ante, sed viverra nunc tinci dunt nec
                    elei fend et tiram.
                  </p>
                </div>
              </div>
              <div class="lg:w-1/3 md:w-1/2 w-full p-4">
                <div class="about-text bg-gray-100 p-6 rounded-lg shadow">
                  <h3 class="text-xl font-semibold mb-4">Our Mission</h3>
                  <p class="text-gray-600">
                    Lorem ipsum dolor sit amet, con se ctetur adipiscing elit.
                    In sagittis eg esta ante, sed viverra nunc tinci dunt nec
                    elei fend et tiram.
                  </p>
                </div>
              </div>
              <div class="lg:w-1/3 md:w-1/2 w-full p-4">
                <div class="about-text bg-gray-100 p-6 rounded-lg shadow">
                  <h3 class="text-xl font-semibold mb-4">Who We Are</h3>
                  <p class="text-gray-600">
                    Lorem ipsum dolor sit amet, con se ctetur adipiscing elit.
                    In sagittis eg esta ante, sed viverra nunc tinci dunt nec
                    elei fend et tiram.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="container mx-auto mt-10">
        <div class="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-8">
          <div class="single-banner-boxes p-6 rounded-lg shadow hover:shadow-lg transition">
            <div class="icon text-gray-700 mb-4">
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
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold mb-2">Financial Planning</h3>
            <p class="text-gray-600">
              Develop and implement comprehensive financial strategies to ensure
              the organization's long-term financial stability and growth.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Abouts;
