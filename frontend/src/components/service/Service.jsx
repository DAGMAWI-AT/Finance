import React from "react";
import "./Service.css";
import {
  Dashboard,
  Email,
  Settings,

} from "@mui/icons-material";

const services = [
  {
    id: 1,
    icon: <Settings />,
    title: "Incredible Infrastructure",
    description:
      "Lorem ipsum dolor amet, adipiscing, sed do eiusmod tempor incididunt ut labore dolore magna aliqua.",
    link: "/services/service-details/",
  },
  {
    id: 2,
    icon: <Email />,
    title: "Email Notifications",
    description:
      "Lorem ipsum dolor amet, adipiscing, sed do eiusmod tempor incididunt ut labore dolore magna aliqua.",
    link: "/services/service-details/",
  },
  {
    id: 3,
    icon: <Dashboard />,
    title: "Simple Dashboard",
    description:
      "Lorem ipsum dolor amet, adipiscing, sed do eiusmod tempor incididunt ut labore dolore magna aliqua.",
    link: "/services/service-details/",
  },
  {
    id: 4,
    icon: <Dashboard />,
    title: "Simple Dashboard",
    description:
      "Lorem ipsum dolor amet, adipiscing, sed do eiusmod tempor incididunt ut labore dolore magna aliqua.",
    link: "/services/service-details/",
  },
];
const Service = () => {
  return (
    <div>
      <div className="page-title-area">
        <div className="d-table">
          <div className="d-table-cell">
            <div className="container">
              <h2>Services</h2>
            </div>
          </div>
        </div>
        <div className="shape1">
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
        <div className="shape2 rotateme">
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
        <div className="shape3">
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
        <div className="shape4">
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
        <div className="shape5">
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
        <div className="shape6 rotateme">
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
        <div className="shape7">
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
        <div className="shape8 rotateme">
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

      <div className="services-area-two  pt-8 pb-50 bg-f9f6f6">
        <div className="containers">
          <div className="section-title">
            <h2>Our Services</h2>
            <div className="bar"></div>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
          <div className=" flex flex-wrap justify-content-start">
            {services.map((service) => (
              <div className="col-lg-4 col-sm-6">
                <div className="single-services-box">
                  <div className="icon">{service.icon}</div>
                  <h3>
                    <a href={service.link}>{service.title}</a>
                  </h3>
                  <p>{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Service;
