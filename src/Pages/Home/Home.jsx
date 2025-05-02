import React from "react";
import "./Home.css";
export default function Home() {
  return (
    <div className="home">
      <div className="section1">
        <div className="left">
          <h1>New language, new opportunities, new you</h1>
          <p>
            Get access to compact lessons from the experts and connect with a
            community of native speakers to help you master words faster.
          </p>
        </div>
        <div className="right">
          <img
            src="https://www.busuu.com/user/pages/home/_01-header/busuu-header-hello.png"
            alt=""
            className="logo"
            width={740}
            height={450}
          />
        </div>
      </div>
      <div className="section2">
        <div className="text">I want to learn</div>
        <div className="languages">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Flag_of_the_United_Kingdom_%283-5%29.svg/langfr-250px-Flag_of_the_United_Kingdom_%283-5%29.svg.png"
            alt=""
            className="logo"
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Flag_of_France.svg/800px-Flag_of_France.svg.png"
            alt=""
            className="logo"
          />{" "}
          <img
            src="https://img.freepik.com/vecteurs-libre/illustration-du-drapeau-allemand_53876-27101.jpg?semt=ais_hybrid&w=740"
            alt=""
            className="logo"
          />{" "}
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Flag_of_Italy.svg/langfr-250px-Flag_of_Italy.svg.png"
            alt=""
            className="logo"
          />{" "}
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Flag_of_Japan.svg/langfr-250px-Flag_of_Japan.svg.png"
            alt=""
            className="logo"
          />{" "}
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Flag_of_Spain.svg/2560px-Flag_of_Spain.svg.png"
            alt=""
            className="logo"
          />{" "}
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Flag_of_South_Korea.svg/1200px-Flag_of_South_Korea.svg.png"
            alt=""
            className="logo"
          />{" "}
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Flag_of_Turkey.svg/2560px-Flag_of_Turkey.svg.png"
            alt=""
            className="logo"
          />{" "}
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Flag_of_Saudi_Arabia.svg/1200px-Flag_of_Saudi_Arabia.svg.png"
            alt=""
            className="logo"
          />{" "}
          <img
            src="https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Flag_of_Brazil.svg/1200px-Flag_of_Brazil.svg.png"
            alt=""
            className="logo"
          />{" "}
          <img
            src="https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/Flag_of_Russia.svg/1200px-Flag_of_Russia.svg.png"
            alt=""
            className="logo"
          />{" "}
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Flag_of_the_Netherlands.svg/1200px-Flag_of_the_Netherlands.svg.png"
            alt=""
            className="logo"
          />
        </div>
      </div>
    </div>
  );
}
