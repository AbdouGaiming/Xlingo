import React from "react";
import "./Home.css";

const languageData = [
  {
    id: "en",
    name: "English",
    flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Flag_of_the_United_Kingdom_%283-5%29.svg/langfr-250px-Flag_of_the_United_Kingdom_%283-5%29.svg.png",
  },
  {
    id: "fr",
    name: "French",
    flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Flag_of_France.svg/800px-Flag_of_France.svg.png",
  },
  {
    id: "de",
    name: "German",
    flag: "https://img.freepik.com/vecteurs-libre/illustration-du-drapeau-allemand_53876-27101.jpg?semt=ais_hybrid&w=740",
  },
  {
    id: "it",
    name: "Italian",
    flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Flag_of_Italy.svg/langfr-250px-Flag_of_Italy.svg.png",
  },
  {
    id: "jp",
    name: "Japanese",
    flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Flag_of_Japan.svg/langfr-250px-Flag_of_Japan.svg.png",
  },
  {
    id: "es",
    name: "Spanish",
    flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Flag_of_Spain.svg/2560px-Flag_of_Spain.svg.png",
  },
  {
    id: "kr",
    name: "Korean",
    flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Flag_of_South_Korea.svg/1200px-Flag_of_South_Korea.svg.png",
  },
  {
    id: "tr",
    name: "Turkish",
    flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Flag_of_Turkey.svg/2560px-Flag_of_Turkey.svg.png",
  },
  {
    id: "sa",
    name: "Arabic",
    flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Flag_of_Saudi_Arabia.svg/1200px-Flag_of_Saudi_Arabia.svg.png",
  },
  {
    id: "br",
    name: "Portuguese",
    flag: "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Flag_of_Brazil.svg/1200px-Flag_of_Brazil.svg.png",
  },
  {
    id: "ru",
    name: "Russian",
    flag: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/Flag_of_Russia.svg/1200px-Flag_of_Russia.svg.png",
  },
  {
    id: "nl",
    name: "Dutch",
    flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Flag_of_the_Netherlands.svg/1200px-Flag_of_the_Netherlands.svg.png",
  },
];

export default function Home() {
  const handleLanguageClick = (language) => {
    console.log(`Selected language: ${language.name}`);
    // Could redirect to language selection page or trigger language selection
  };

  return (
    <div className="home">
      <div className="section1">
        <div className="left">
          <h1>
            <span>X</span>lingo
          </h1>
          <div className="text">Speak to the World in Every Language</div>
        </div>
        <div className="right">
          <img
            src="https://www.busuu.com/user/pages/home/_01-header/busuu-header-hello.png"
            alt=""
            className="logo"
            style={{ width: "94%", height: "90%" }}
          />
        </div>
      </div>{" "}
      <div className="section3">
        <div className="left">
          <img
            src="https://cdni.iconscout.com/illustration/premium/thumb/online-language-learning-illustration-download-in-svg-png-gif-file-formats--course-application-app-school-pack-education-illustrations-5319561.png"
            alt=""
            className="logo"
            style={{ width: "140%", height: "120%" }}
          />
        </div>
        <div className="right">
          <h1>Free. Fun. Effective.</h1>
          <div className="text">
            Learning with Xlingo is fun, and research shows that it works! With
            quick, bite-sized lessons, you’ll earn points and unlock new levels
            while gaining real-world communication skills.
          </div>
        </div>
      </div>
      <div className="section2">
        <div className="text">I want to learn</div>
        <div className="languages">
          {languageData.map((language) => (
            <div
              key={language.id}
              className="language-container"
              onClick={() => handleLanguageClick(language)}
            >
              <div className="language-tooltip">{language.name}</div>
              <img src={language.flag} alt={language.name} className="logo" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
