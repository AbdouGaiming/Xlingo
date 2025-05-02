import React from "react";
import { FaInstagram, FaYoutube, FaLinkedin } from "react-icons/fa";
import "./Footer.scss";

const Footer = () => {
  return (
    <div className="section4">
      <div className="footer-section">
        <div className="footer-content">
          <div className="footer-top">
            <div className="social-section">
              <div className="social-category">
                <h4>Social Media</h4>
                <div className="footer-icons">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Instagram"
                  >
                    <FaInstagram className="social-icon" />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="YouTube"
                  >
                    <FaYoutube className="social-icon" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="LinkedIn"
                  >
                    <FaLinkedin className="social-icon" />
                  </a>
                </div>
              </div>
            </div>

            <div className="mission-statement">
              <h3>Breaking Language Barriers</h3>
              <p>
                Join millions of learners worldwide in their language journey
              </p>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="copyright">© 2025 Xlingo. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
