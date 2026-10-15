// src/pages/About.js
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaRocket, FaShieldAlt, FaUsers, FaGlobe, FaHeart,
  FaCheckCircle, FaChartLine, FaRobot, FaLightbulb,
  FaHandshake, FaAward, FaClock, FaEnvelope, FaPhoneAlt,
  FaLinkedin, FaTwitter, FaFacebook, FaMapMarkerAlt,
  FaBullseye, FaEye, FaGem, FaIndustry, FaHardHat,
  FaFire, FaFlask, FaPlane, FaShip, FaTruck, FaLeaf
} from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';

// ============================================================
// AFDALTECH SOLUTIONS / SAFETRACK PRO GLOBAL
// About Us Page — International Edition
// Brand Colors: #1A2A6C (Navy) + #C9A84C (Gold)
// ============================================================

const COMPANY = {
  name: 'SafeTrack Pro Global',
  parent: 'AfdalTech Solutions',
  tagline: 'The Future of Technology',
  email: 'info@safetrackproglobal.com',
  phone: '+974 3325 1705',
  phone2: '+971 50 000 0000', // placeholder — replace with your UAE number if real
  address: 'Doha, Qatar',
  region: 'Global Operations',
  website: 'www.safetrackproglobal.com',
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const About = () => {
  return (
    <div className="about-page" style={{
      fontFamily: 'Inter, -apple-system, sans-serif',
      color: '#333',
      background: '#ffffff'
    }}>

      {/* ============================================================
          HERO
      ============================================================ */}
      <section style={{
        padding: '100px 24px 80px',
        background: 'linear-gradient(135deg, #f0f2f8 0%, #e8eaf6 100%)',
        textAlign: 'center'
      }}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          style={{ maxWidth: 800, margin: '0 auto' }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(26, 42, 108, 0.1)',
            padding: '8px 20px',
            borderRadius: 50,
            color: '#1A2A6C',
            fontWeight: 600,
            marginBottom: 24,
            fontSize: 14
          }}>
            <HiOutlineSparkles style={{ color: '#C9A84C' }} /> About Us
          </div>

          <h1 style={{
            fontSize: '3rem',
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: 20,
            background: 'linear-gradient(135deg, #1A2A6C, #C9A84C)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent'
          }}>
            One Platform for<br />Global HSE Excellence
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: '#555',
            lineHeight: 1.7,
            maxWidth: 640,
            margin: '0 auto'
          }}>
            We are {COMPANY.parent} — creators of {COMPANY.name}, an AI-powered
            HSE, environmental, and compliance platform serving
            <strong> 9+ industries</strong> across <strong>Qatar, the Middle East, Africa, and beyond</strong>.
          </p>
        </motion.div>
      </section>

      {/* ============================================================
          OUR STORY
      ============================================================ */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 60,
              alignItems: 'center'
            }}
          >
            <motion.div variants={fadeInUp}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: '#1A2A6C',
                marginBottom: 20
              }}>
                Our Story
              </h2>
              <p style={{ fontSize: '1rem', color: '#555', lineHeight: 1.8, marginBottom: 16 }}>
                SafeTrack Pro was born from a simple observation: <strong>HSE professionals,
                safety officers, and compliance teams across every industry were drowning in
                spreadsheets</strong>, manual reports, and disconnected tools that could not
                keep up with modern regulatory demands.
              </p>
              <p style={{ fontSize: '1rem', color: '#555', lineHeight: 1.8, marginBottom: 16 }}>
                We saw incidents go unanalyzed, permits expire unnoticed, compliance gaps slip
                through the cracks, and environmental metrics tracked by hand. Meanwhile, safety
                teams in <strong>construction, oil &amp; gas, manufacturing, mining, healthcare,
                aviation, maritime, agriculture, and education</strong> all deserved intelligent
                tools designed for their industries — not generic templates.
              </p>
              <p style={{ fontSize: '1rem', color: '#555', lineHeight: 1.8 }}>
                So we built it. SafeTrack Pro is a complete platform that combines
                <strong> AI-powered risk analysis, real-time camera monitoring, compliance
                automation, document lifecycle control, and environmental intelligence</strong>
                into one seamless experience — configurable for any industry.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} style={{
              background: 'linear-gradient(135deg, #1A2A6C, #C9A84C)',
              borderRadius: 24,
              padding: 40,
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎯</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>
                Our Mission
              </h3>
              <p style={{ fontSize: '1rem', opacity: 0.95, lineHeight: 1.6 }}>
                To empower every HSE professional, safety officer, and compliance team —
                in every industry, in every region — with technology that saves lives,
                ensures compliance, and protects the environment.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          WHAT WE DO
      ============================================================ */}
      <section style={{
        padding: '80px 24px',
        background: '#f8f9fa'
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            style={{ textAlign: 'center', marginBottom: 60 }}
          >
            <h2 style={{
              fontSize: '2.25rem',
              fontWeight: 700,
              color: '#1A2A6C',
              marginBottom: 12
            }}>
              What We Do
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#6c757d', maxWidth: 640, margin: '0 auto' }}>
              Four core modules, one intelligent platform — built for every industry
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 24
            }}
          >
            {[
              {
                icon: <FaShieldAlt />,
                title: 'HSE Management',
                desc: 'Incident reporting, root cause analysis with AI-powered Fishbone diagrams, permit-to-work systems, safety observations, and predictive risk assessment — configurable for every industry.'
              },
              {
                icon: <FaGlobe />,
                title: 'Environmental Intelligence',
                desc: 'Real-time air, water, and emissions monitoring, carbon footprint tracking, ESG scoring, biodiversity monitoring, and sustainability goal management.'
              },
              {
                icon: <FaLeaf />,
                title: 'Compliance & Documentation',
                desc: 'AI-generated SOPs, JHAs, and permits. Automated regulatory tracking across OSHA, ISO 45001, ISO 14001, EPA, HIPAA, MLC 2006, ICAO SMS, MSHA, REACH, and more.'
              },
              {
                icon: <FaRobot />,
                title: 'AI & Camera Monitoring',
                desc: 'Real-time AI camera monitoring for PPE compliance, unsafe behavior, and hazard detection. Predictive analytics, document classification, and automated reporting.'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                style={{
                  background: 'white',
                  padding: 32,
                  borderRadius: 20,
                  border: '1px solid rgba(201, 168, 76, 0.15)',
                  transition: 'all 0.3s',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  background: 'rgba(26, 42, 108, 0.08)',
                  color: '#1A2A6C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  margin: '0 auto 20px'
                }}>
                  {item.icon}
                </div>
                <h3 style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: '#1A2A6C',
                  marginBottom: 12
                }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.95rem', color: '#6c757d', lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          INDUSTRIES WE SERVE  ← NEW
      ============================================================ */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            style={{ textAlign: 'center', marginBottom: 60 }}
          >
            <h2 style={{
              fontSize: '2.25rem',
              fontWeight: 700,
              color: '#1A2A6C',
              marginBottom: 12
            }}>
              Industries We Serve
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#6c757d', maxWidth: 640, margin: '0 auto' }}>
              Purpose-built safety solutions for every major industrial sector — worldwide
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 16
            }}
          >
            {[
              { icon: <FaHardHat />, label: 'Construction' },
              { icon: <FaFire />, label: 'Oil & Gas' },
              { icon: <FaIndustry />, label: 'Manufacturing' },
              { icon: <FaHeart />, label: 'Healthcare' },
              { icon: <FaGem />, label: 'Mining' },
              { icon: <FaFlask />, label: 'Chemical' },
              { icon: <FaPlane />, label: 'Aviation' },
              { icon: <FaShip />, label: 'Maritime' },
              { icon: <FaTruck />, label: 'Logistics' },
              { icon: <FaLeaf />, label: 'Agriculture' },
              { icon: <FaUsers />, label: 'Education' },
              { icon: <FaChartLine />, label: 'Energy & Utilities' }
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                  padding: '24px 12px',
                  background: 'white',
                  border: '1px solid rgba(26, 42, 108, 0.1)',
                  borderRadius: 16,
                  textAlign: 'center',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{ fontSize: '1.6rem', color: '#C9A84C' }}>{item.icon}</div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1A2A6C' }}>
                  {item.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          OUR VALUES
      ============================================================ */}
      <section style={{ padding: '80px 24px', background: '#f8f9fa' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            style={{ textAlign: 'center', marginBottom: 60 }}
          >
            <h2 style={{
              fontSize: '2.25rem',
              fontWeight: 700,
              color: '#1A2A6C',
              marginBottom: 12
            }}>
              Our Values
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#6c757d' }}>
              The principles that guide everything we build
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 24
            }}
          >
            {[
              { icon: <FaLightbulb />, title: 'Innovation First', desc: 'We embrace AI, automation, and modern technology to solve real-world safety challenges across every industry.' },
              { icon: <FaHandshake />, title: 'Trust & Integrity', desc: 'We build tools that professionals can rely on when lives and livelihoods are at stake.' },
              { icon: <FaUsers />, title: 'Customer Obsessed', desc: 'Every feature, every fix, every improvement starts with listening to our users.' },
              { icon: <FaAward />, title: 'Excellence', desc: 'We deliver enterprise-grade quality — from the code we write to the support we provide.' },
              { icon: <FaClock />, title: 'Reliability', desc: 'When professionals depend on us, we must be available, accurate, and fast.' },
              { icon: <FaGem />, title: 'Global Accessibility', desc: 'We make world-class safety technology affordable and accessible across the Middle East, Africa, Asia, and beyond.' }
            ].map((value, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                style={{
                  padding: 28,
                  borderLeft: '4px solid #C9A84C',
                  background: 'white',
                  borderRadius: 12
                }}
              >
                <div style={{
                  color: '#C9A84C',
                  fontSize: '1.8rem',
                  marginBottom: 12
                }}>
                  {value.icon}
                </div>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#1A2A6C',
                  marginBottom: 8
                }}>
                  {value.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#6c757d', lineHeight: 1.6 }}>
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          WHY CHOOSE US
      ============================================================ */}
      <section style={{
        padding: '80px 24px',
        background: 'linear-gradient(135deg, #0A1628 0%, #1A2A6C 100%)',
        color: 'white'
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            style={{ textAlign: 'center', marginBottom: 60 }}
          >
            <h2 style={{
              fontSize: '2.25rem',
              fontWeight: 700,
              marginBottom: 12
            }}>
              Why Choose {COMPANY.name}?
            </h2>
            <p style={{ fontSize: '1.1rem', opacity: 0.85 }}>
              Built for professionals in every industry who cannot afford to get it wrong
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 20
            }}
          >
            {[
              'AI-powered incident investigation and root cause analysis',
              'Real-time AI camera monitoring for PPE and hazard detection',
              'Multi-industry compliance: OSHA, ISO 45001, ISO 14001, HIPAA, MLC, ICAO SMS, MSHA, REACH',
              'Live environmental monitoring with ESG and sustainability reporting',
              'Full document lifecycle: auto-generate, sign, approve, archive',
              'Configurable for 9+ industries — from construction to healthcare',
              'Cloud-based with regional data residency options',
              'Enterprise-grade security, SOC2, and ISO 27001 practices'
            ].map((point, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: 16,
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 12
                }}
              >
                <FaCheckCircle style={{
                  color: '#C9A84C',
                  fontSize: '1.2rem',
                  flexShrink: 0,
                  marginTop: 2
                }} />
                <span style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{point}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          OUR REACH  ← NEW: replaces "Built in Ghana"
      ============================================================ */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 style={{
              fontSize: '2.25rem',
              fontWeight: 700,
              color: '#1A2A6C',
              marginBottom: 16
            }}>
              Headquartered in Doha.<br />Built for the World.
            </h2>
            <p style={{
              fontSize: '1.05rem',
              color: '#555',
              lineHeight: 1.8,
              maxWidth: 720,
              margin: '0 auto 32px'
            }}>
              {COMPANY.parent} is a global technology company with headquarters in
              <strong> Doha, Qatar</strong> and operations across the Middle East, Africa,
              and Asia. Our mission: bring enterprise-grade HSE, environmental, and
              compliance technology to organizations of every size — from single-site
              operations to multi-national enterprises.
            </p>

            <div style={{
              background: 'linear-gradient(135deg, #1A2A6C, #C9A84C)',
              borderRadius: 20,
              padding: 32,
              color: 'white',
              display: 'inline-block',
              maxWidth: 520
            }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🌍</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>
                {COMPANY.name}
              </h3>
              <p style={{ fontSize: '0.95rem', opacity: 0.95, marginBottom: 4 }}>
                {COMPANY.tagline}
              </p>
              <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                A product of {COMPANY.parent} · {COMPANY.address}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          CTA
      ============================================================ */}
      <section style={{
        padding: '80px 24px',
        background: '#f8f9fa',
        textAlign: 'center'
      }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          style={{ maxWidth: 700, margin: '0 auto' }}
        >
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#1A2A6C',
            marginBottom: 16
          }}>
            Ready to Transform Your HSE Program?
          </h2>
          <p style={{
            fontSize: '1.05rem',
            color: '#555',
            marginBottom: 32,
            lineHeight: 1.6
          }}>
            Join safety, environmental, and compliance teams across 9+ industries worldwide
            who trust {COMPANY.name} to keep their people safe and their operations compliant.
          </p>

          <div style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link
              to="/signup"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 36px',
                borderRadius: 50,
                fontWeight: 600,
                textDecoration: 'none',
                background: 'linear-gradient(135deg, #1A2A6C, #C9A84C)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(26, 42, 108, 0.25)'
              }}
            >
              Start Free Trial <FaRocket />
            </Link>
            <Link
              to="/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 36px',
                borderRadius: 50,
                fontWeight: 600,
                textDecoration: 'none',
                background: 'transparent',
                color: '#1A2A6C',
                border: '2px solid #1A2A6C'
              }}
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ============================================================
          CONTACT
      ============================================================ */}
      <section style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 24,
            textAlign: 'center'
          }}>
            <div>
              <FaEnvelope style={{ fontSize: '1.8rem', color: '#C9A84C', marginBottom: 12 }} />
              <h4 style={{ color: '#1A2A6C', marginBottom: 6 }}>Email</h4>
              <a
                href={`mailto:${COMPANY.email}`}
                style={{ color: '#555', textDecoration: 'none', fontSize: 14 }}
              >
                {COMPANY.email}
              </a>
            </div>
            <div>
              <FaPhoneAlt style={{ fontSize: '1.8rem', color: '#C9A84C', marginBottom: 12 }} />
              <h4 style={{ color: '#1A2A6C', marginBottom: 6 }}>Phone</h4>
              <div style={{ color: '#555', fontSize: 14 }}>
                {COMPANY.phone}
              </div>
            </div>
            <div>
              <FaMapMarkerAlt style={{ fontSize: '1.8rem', color: '#C9A84C', marginBottom: 12 }} />
              <h4 style={{ color: '#1A2A6C', marginBottom: 6 }}>Headquarters</h4>
              <div style={{ color: '#555', fontSize: 14 }}>{COMPANY.address}</div>
              <div style={{ color: '#8a94a6', fontSize: 12, marginTop: 4 }}>{COMPANY.region}</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
