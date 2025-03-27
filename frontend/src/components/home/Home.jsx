// Home.js
import React from "react";
import Hero from "./hero/Hero";
import WhatWeDo from "./what_we_do/What_We_Do";
import WhoWeAre from "./who_we_are/Who_we_are";

const Home = () => {
  return (
    <div className="overflow-hidden">
      <Hero />
      <WhoWeAre />
      <WhatWeDo />
    </div>
  );
};

export default Home;