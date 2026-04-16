'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const blogPosts = {
  'top-5-features-rugged-smartphone': {
    title: 'Top 5 Features to Look for in a Rugged Smartphone',
    excerpt: 'When choosing a rugged smartphone, there are key features that separate the truly durable from the merely marketed.',
    date: 'Jan 8, 2026',
    category: 'Buying Guide',
    readTime: '5 min read',
    image: '/blog-images/rugged_smartphone_construction_site.png',
    content: `
      <p>In today's demanding work environments, a standard smartphone simply won't cut it. Whether you're working on a construction site, in the field, or in any challenging environment, you need a device that can keep up with your lifestyle. Here's what to look for when choosing a rugged smartphone.</p>

      <h2>1. IP68/IP69K Water and Dust Resistance</h2>
      <p>The IP rating is the first thing you should check. IP68 means your phone can survive being submerged in water up to 1.5 meters for 30 minutes. IP69K goes further, protecting against high-pressure, high-temperature water jets. For truly rugged use, look for at least IP68 certification.</p>
      <p>At RUGGTECH, all our rugged devices carry minimum IP68 ratings, with many offering IP69K for the most demanding environments.</p>

      <h2>2. MIL-STD-810G/H Certification</h2>
      <p>This military standard tests devices against extreme conditions including:</p>
      <ul>
        <li>Temperature extremes (-20°C to 60°C)</li>
        <li>Humidity and salt fog exposure</li>
        <li>Shock and vibration resistance</li>
        <li>Drop tests from various heights</li>
        <li>Altitude pressure changes</li>
      </ul>
      <p>A phone with MIL-STD certification has been tested to withstand real-world abuse, not just marketing claims.</p>

      <h2>3. Gorilla Glass Victus or Sapphire Display</h2>
      <p>The screen is often the most vulnerable part of any phone. Look for devices featuring Corning Gorilla Glass Victus or sapphire crystal displays. These materials offer superior scratch and impact resistance compared to standard glass.</p>
      <p>Some rugged phones also feature screen protectors built into the design, adding an extra layer of protection.</p>

      <h2>4. Extended Battery Life</h2>
      <p>Rugged phones typically feature larger batteries (5000mAh to 10000mAh) because they're designed for fieldwork where charging opportunities are limited. Look for:</p>
      <ul>
        <li>Minimum 5000mAh battery capacity</li>
        <li>Fast charging support (18W or higher)</li>
        <li>Wireless charging capability</li>
        <li>Reverse wireless charging for emergencies</li>
      </ul>

      <h2>5. Specialized Features for Your Use Case</h2>
      <p>The best rugged phone depends on your specific needs:</p>
      <ul>
        <li><strong>Thermal/FLIR cameras</strong> - Essential for contractors, electricians, and first responders</li>
        <li><strong>Night vision</strong> - Perfect for security, hunting, and outdoor adventures</li>
        <li><strong>PTT (Push-to-Talk)</strong> - Ideal for team communication in noisy environments</li>
        <li><strong>Barcode scanners</strong> - Great for warehouse and inventory work</li>
        <li><strong>Extended range antennas</strong> - Better signal in remote areas</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Investing in a quality rugged smartphone pays dividends in reliability and longevity. While they may cost more upfront, the durability and specialized features make them far more cost-effective than replacing standard phones every few months.</p>
      <p>Browse our collection of rugged devices to find the perfect match for your needs. All RUGGTECH products come with a comprehensive warranty and our satisfaction guarantee.</p>
    `
  },
  'farming-equipment-maintenance': {
    title: 'How to Maintain Your Farming Equipment for Longevity',
    excerpt: 'Regular maintenance is key to getting the most out of your agricultural equipment investment.',
    date: 'Jan 2, 2026',
    category: 'Tips & Guides',
    readTime: '7 min read',
    image: '/blog-images/tractor_in_wheat_field.png',
    content: `
      <p>Agricultural equipment represents a significant investment for any farm operation. Proper maintenance not only extends the life of your machinery but also ensures peak performance during critical seasons. Here's our comprehensive guide to keeping your farming equipment in top condition.</p>

      <h2>Daily Maintenance Checklist</h2>
      <p>Before starting any equipment for the day, perform these quick checks:</p>
      <ul>
        <li>Check oil levels in engine and hydraulic systems</li>
        <li>Inspect coolant levels and radiator condition</li>
        <li>Examine tires for proper inflation and damage</li>
        <li>Look for fluid leaks under the equipment</li>
        <li>Test all lights and signals</li>
        <li>Clear debris from air intakes and radiators</li>
      </ul>

      <h2>Seasonal Maintenance Schedule</h2>
      <h3>Spring Preparation</h3>
      <p>Before the busy planting season:</p>
      <ul>
        <li>Change all filters (oil, fuel, air, hydraulic)</li>
        <li>Replace worn belts and hoses</li>
        <li>Grease all fittings and pivot points</li>
        <li>Test battery and charging system</li>
        <li>Calibrate planting equipment</li>
      </ul>

      <h3>Fall Preparation</h3>
      <p>After harvest, before storage:</p>
      <ul>
        <li>Thoroughly clean all equipment</li>
        <li>Touch up paint on exposed metal</li>
        <li>Apply rust inhibitor to bare surfaces</li>
        <li>Drain fuel or add stabilizer</li>
        <li>Disconnect batteries for long storage</li>
      </ul>

      <h2>Critical Systems to Monitor</h2>
      <h3>Hydraulic Systems</h3>
      <p>Hydraulic systems are the lifeblood of modern farm equipment. Check fluid levels daily and change filters according to manufacturer schedules. Watch for slow cylinder movement or unusual noises that indicate problems.</p>

      <h3>Electrical Systems</h3>
      <p>Modern tractors and harvesters rely heavily on electronics. Keep connections clean and dry, and address any warning lights immediately. A failing sensor can lead to expensive repairs if ignored.</p>

      <h2>When to Call a Professional</h2>
      <p>While many maintenance tasks can be done in-house, some require professional attention:</p>
      <ul>
        <li>Engine overhauls and major repairs</li>
        <li>Transmission problems</li>
        <li>Computer diagnostics and software updates</li>
        <li>Welding and structural repairs</li>
        <li>Hydraulic pump and motor replacement</li>
      </ul>

      <h2>Conclusion</h2>
      <p>A well-maintained piece of farm equipment can serve you for decades. The time and money invested in regular maintenance pays back many times over in reliability, efficiency, and resale value.</p>
      <p>Need parts or accessories for your farm equipment? Check out our farming equipment section for quality products at competitive prices.</p>
    `
  },
  'evolution-rugged-technology': {
    title: 'The Evolution of Rugged Technology: From Military to Everyday Use',
    excerpt: 'Explore how rugged technology has evolved from specialized military equipment to consumer products.',
    date: 'Dec 28, 2025',
    category: 'Industry Insights',
    readTime: '6 min read',
    image: '/blog-images/military_rugged_tablet_gear.png',
    content: `
      <p>The rugged technology we use today has its roots in military applications dating back decades. The journey from specialized military equipment to everyday consumer devices is a fascinating story of innovation and adaptation.</p>

      <h2>The Military Origins</h2>
      <p>In the 1980s and 1990s, the U.S. Department of Defense needed electronics that could survive battlefield conditions. This led to the development of the MIL-STD-810 standard, which defines a series of environmental tests for military equipment.</p>
      <p>Early rugged computers were massive, expensive, and designed exclusively for military use. They could withstand:</p>
      <ul>
        <li>Extreme temperatures (-40°C to 70°C)</li>
        <li>High humidity and salt spray</li>
        <li>Shock from explosions and impacts</li>
        <li>Vibration from vehicles and aircraft</li>
        <li>Electromagnetic interference</li>
      </ul>

      <h2>The Industrial Revolution</h2>
      <p>By the early 2000s, industries began recognizing the value of rugged technology. Oil and gas, construction, and manufacturing sectors needed devices that could handle harsh environments without the military price tag.</p>
      <p>This demand drove manufacturers to develop more affordable rugged devices while maintaining durability standards. Features like IP ratings became important selling points.</p>

      <h2>The Consumer Crossover</h2>
      <p>The real breakthrough came with smartphones. As consumers became more active and outdoor-focused, they demanded phones that could keep up. Early attempts were bulky and unattractive, but modern rugged smartphones have changed this perception.</p>
      <p>Today's rugged consumer devices offer:</p>
      <ul>
        <li>Sleek, attractive designs</li>
        <li>Full smartphone functionality</li>
        <li>Specialized features like thermal cameras</li>
        <li>Competitive pricing</li>
        <li>Consumer-friendly warranties</li>
      </ul>

      <h2>Modern Innovations</h2>
      <p>Current rugged technology incorporates cutting-edge features:</p>
      <ul>
        <li><strong>Thermal imaging</strong> - FLIR sensors for temperature detection</li>
        <li><strong>Night vision</strong> - Advanced sensors for low-light photography</li>
        <li><strong>Satellite connectivity</strong> - Emergency communication anywhere</li>
        <li><strong>Extended battery life</strong> - Multi-day usage on single charge</li>
        <li><strong>5G connectivity</strong> - High-speed data in rugged form factors</li>
      </ul>

      <h2>The Future of Rugged Tech</h2>
      <p>The future looks bright for rugged technology. Trends we're watching include:</p>
      <ul>
        <li>Foldable rugged displays</li>
        <li>AI-powered environmental sensors</li>
        <li>Modular designs for customization</li>
        <li>Sustainable and recyclable materials</li>
        <li>Integration with IoT and smart systems</li>
      </ul>

      <h2>Conclusion</h2>
      <p>From battlefield communication to everyday adventures, rugged technology has come a long way. At RUGGTECH, we're proud to offer devices that carry on this legacy of durability and innovation.</p>
    `
  },
  'understanding-ip-ratings': {
    title: 'Understanding IP Ratings: What IP68 Really Means',
    excerpt: 'IP ratings can be confusing. We break down what each number means and how it applies to your devices.',
    date: 'Dec 20, 2025',
    category: 'Education',
    readTime: '4 min read',
    image: '/blog-images/waterproof_phone_underwater.png',
    content: `
      <p>When shopping for rugged devices, you'll frequently encounter IP ratings like IP67, IP68, or IP69K. Understanding these ratings is crucial for choosing the right device for your needs. Let's break down what these numbers actually mean.</p>

      <h2>What is an IP Rating?</h2>
      <p>IP stands for "Ingress Protection" (sometimes called "International Protection"). It's a standard defined by the International Electrotechnical Commission (IEC) that classifies the degree of protection against solid objects and liquids.</p>
      <p>The IP rating consists of two digits:</p>
      <ul>
        <li><strong>First digit (0-6)</strong>: Protection against solid objects</li>
        <li><strong>Second digit (0-9K)</strong>: Protection against liquids</li>
      </ul>

      <h2>First Digit: Solid Object Protection</h2>
      <table>
        <tr><td><strong>0</strong></td><td>No protection</td></tr>
        <tr><td><strong>1</strong></td><td>Protected against objects larger than 50mm</td></tr>
        <tr><td><strong>2</strong></td><td>Protected against objects larger than 12.5mm</td></tr>
        <tr><td><strong>3</strong></td><td>Protected against objects larger than 2.5mm</td></tr>
        <tr><td><strong>4</strong></td><td>Protected against objects larger than 1mm</td></tr>
        <tr><td><strong>5</strong></td><td>Dust protected (limited ingress permitted)</td></tr>
        <tr><td><strong>6</strong></td><td>Dust tight (no ingress permitted)</td></tr>
      </table>

      <h2>Second Digit: Liquid Protection</h2>
      <table>
        <tr><td><strong>0</strong></td><td>No protection</td></tr>
        <tr><td><strong>1</strong></td><td>Protected against dripping water</td></tr>
        <tr><td><strong>2</strong></td><td>Protected against dripping water when tilted</td></tr>
        <tr><td><strong>3</strong></td><td>Protected against spraying water</td></tr>
        <tr><td><strong>4</strong></td><td>Protected against splashing water</td></tr>
        <tr><td><strong>5</strong></td><td>Protected against water jets</td></tr>
        <tr><td><strong>6</strong></td><td>Protected against powerful water jets</td></tr>
        <tr><td><strong>7</strong></td><td>Protected against temporary immersion (1m for 30 min)</td></tr>
        <tr><td><strong>8</strong></td><td>Protected against continuous immersion (depth specified)</td></tr>
        <tr><td><strong>9K</strong></td><td>Protected against high-pressure, high-temperature jets</td></tr>
      </table>

      <h2>Common Ratings Explained</h2>
      <h3>IP67</h3>
      <p>Dust tight and can be submerged in 1 meter of water for 30 minutes. Good for occasional splashes and rain, but not for swimming or diving.</p>

      <h3>IP68</h3>
      <p>Dust tight and can be submerged beyond 1 meter (manufacturer specifies depth). Most rugged phones are rated for 1.5-2 meters for 30+ minutes. Suitable for underwater photography and accidental drops in water.</p>

      <h3>IP69K</h3>
      <p>The highest rating available. Dust tight and protected against high-pressure, high-temperature water jets. Originally designed for road vehicles that need regular steam cleaning.</p>

      <h2>Important Caveats</h2>
      <p>Keep these points in mind:</p>
      <ul>
        <li>IP ratings are tested in freshwater - salt water and chlorine can cause damage</li>
        <li>Ratings apply to new devices - seals can degrade over time</li>
        <li>Drops and impacts can compromise seals</li>
        <li>Water damage is often not covered by warranty despite IP ratings</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Understanding IP ratings helps you choose the right device for your environment. For most outdoor and industrial use, IP68 provides excellent protection. For environments with high-pressure washing or extreme conditions, look for IP69K.</p>
      <p>All RUGGTECH devices clearly display their IP ratings, so you can make an informed decision for your specific needs.</p>
    `
  },
  'suzuki-maintenance-off-road': {
    title: 'Best Suzuki Maintenance Tips for Off-Road Enthusiasts',
    excerpt: 'Keep your Suzuki running strong with these essential maintenance practices for off-road adventures.',
    date: 'Dec 15, 2025',
    category: 'Tips & Guides',
    readTime: '8 min read',
    image: '/blog-images/suzuki_off-road_adventure.png',
    content: `
      <p>Suzuki vehicles, particularly the Jimny and Grand Vitara, have earned legendary status among off-road enthusiasts. But to keep these capable machines performing at their best, proper maintenance is essential. Here's our comprehensive guide to maintaining your Suzuki for off-road adventures.</p>

      <h2>Pre-Trip Inspection Checklist</h2>
      <p>Before any off-road adventure, perform these essential checks:</p>
      <ul>
        <li>Tire pressure and tread condition</li>
        <li>All fluid levels (oil, coolant, brake, power steering)</li>
        <li>Battery terminals and charge level</li>
        <li>Brake pad thickness and rotor condition</li>
        <li>Suspension components for wear or damage</li>
        <li>Lights and electrical systems</li>
        <li>Winch operation (if equipped)</li>
      </ul>

      <h2>Critical Maintenance for Off-Road Use</h2>
      <h3>Suspension System</h3>
      <p>Off-road driving puts enormous stress on suspension components. Regular inspection should include:</p>
      <ul>
        <li>Shock absorbers for leaks or reduced damping</li>
        <li>Bushings for cracks or deterioration</li>
        <li>Ball joints for play or wear</li>
        <li>Control arm mounts for stress cracks</li>
      </ul>
      <p>Consider upgrading to heavy-duty components if you regularly tackle challenging terrain.</p>

      <h3>Drivetrain Care</h3>
      <p>The 4WD system is your Suzuki's greatest asset off-road. Maintain it properly:</p>
      <ul>
        <li>Change transfer case oil every 30,000 km or annually</li>
        <li>Inspect CV boots for tears after each off-road trip</li>
        <li>Check differential fluid levels monthly</li>
        <li>Grease all driveshaft U-joints regularly</li>
      </ul>

      <h3>Undercarriage Protection</h3>
      <p>Rocks and debris can damage vital components. Consider:</p>
      <ul>
        <li>Installing skid plates for engine and transfer case</li>
        <li>Rock sliders for body protection</li>
        <li>Differential guards for low-hanging axles</li>
        <li>Fuel tank protection for extended trips</li>
      </ul>

      <h2>Post-Trip Maintenance</h2>
      <p>After every off-road adventure:</p>
      <ol>
        <li><strong>Wash thoroughly</strong> - Remove mud, especially from brake components and undercarriage</li>
        <li><strong>Inspect for damage</strong> - Look for dents, scratches, and component damage</li>
        <li><strong>Check for leaks</strong> - Park on cardboard overnight to spot fluid leaks</li>
        <li><strong>Test brakes</strong> - Ensure normal operation after water crossings</li>
        <li><strong>Air filter check</strong> - Dusty conditions can clog filters quickly</li>
      </ol>

      <h2>Essential Upgrades for Serious Off-Roaders</h2>
      <ul>
        <li><strong>Lift kit</strong> - Improved ground clearance for obstacles</li>
        <li><strong>All-terrain tires</strong> - Better grip in varied conditions</li>
        <li><strong>Snorkel</strong> - Safe water crossings and cleaner air intake</li>
        <li><strong>Recovery gear</strong> - Winch, straps, and shackles</li>
        <li><strong>Auxiliary lighting</strong> - LED light bars for night driving</li>
      </ul>

      <h2>Common Suzuki Off-Road Issues</h2>
      <h3>Jimny</h3>
      <ul>
        <li>Clutch wear on steep inclines - Use low range appropriately</li>
        <li>Leaf spring squeaks - Regular lubrication required</li>
        <li>Door seal leaks after mud - Clean and condition seals</li>
      </ul>

      <h3>Grand Vitara</h3>
      <ul>
        <li>Propshaft vibration - Check U-joint condition</li>
        <li>Wheel bearing wear - Listen for humming noises</li>
        <li>Brake dust contamination - Clean after water crossings</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Your Suzuki is designed for adventure, but proper maintenance ensures it's always ready when you are. Regular inspection and timely repairs prevent small issues from becoming trail-ending problems.</p>
      <p>Need parts for your Suzuki? Browse our extensive collection of Suzuki parts and accessories. We stock everything from maintenance items to performance upgrades.</p>
    `
  }
};

export default function BlogPost() {
  const params = useParams();
  const slug = params.slug;
  const post = blogPosts[slug];

  if (!post) {
    return (
      <main className="blog-post-page">
        <div className="container">
          <h1>Post Not Found</h1>
          <p>The blog post you're looking for doesn't exist.</p>
          <Link href="/company/blog" className="back-link">Back to Blog</Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="blog-post-page">
        <div className="hero-image">
          <Image 
            src={post.image} 
            alt={post.title}
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
          <div className="hero-overlay">
            <div className="hero-content">
              <span className="category-tag">{post.category}</span>
              <h1>{post.title}</h1>
              <div className="post-meta">
                <span>{post.date}</span>
                <span className="separator">|</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <Link href="/company/blog" className="back-link">
            <i className="fas fa-arrow-left"></i> Back to Blog
          </Link>
          
          <article className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />

          <div className="share-section">
            <h3>Share this article</h3>
            <div className="share-buttons">
              <button className="share-btn facebook">
                <i className="fab fa-facebook-f"></i>
              </button>
              <button className="share-btn twitter">
                <i className="fab fa-twitter"></i>
              </button>
              <button className="share-btn linkedin">
                <i className="fab fa-linkedin-in"></i>
              </button>
              <button className="share-btn copy" onClick={() => navigator.clipboard.writeText(window.location.href)}>
                <i className="fas fa-link"></i>
              </button>
            </div>
          </div>

          <div className="related-cta">
            <h3>Ready to gear up?</h3>
            <p>Explore our collection of rugged devices and accessories.</p>
            <Link href="/rugged-devices" className="cta-btn">Shop Rugged Devices</Link>
          </div>
        </div>
      </main>

      <style jsx>{`
        .blog-post-page {
          min-height: 100vh;
          background: var(--bg-color);
        }
        .hero-image {
          position: relative;
          height: 400px;
          width: 100%;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 100%);
          display: flex;
          align-items: flex-end;
          padding: 40px;
        }
        .hero-content {
          max-width: 800px;
          color: white;
        }
        .category-tag {
          background: var(--accent);
          color: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          display: inline-block;
          margin-bottom: 15px;
        }
        .hero-content h1 {
          font-size: 36px;
          margin-bottom: 15px;
          line-height: 1.3;
        }
        .post-meta {
          display: flex;
          gap: 10px;
          font-size: 14px;
          opacity: 0.9;
        }
        .separator { opacity: 0.5; }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px 80px;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--accent);
          text-decoration: none;
          margin-bottom: 30px;
          font-weight: 500;
        }
        .back-link:hover { text-decoration: underline; }
        .post-content {
          color: var(--text-light);
          line-height: 1.8;
          font-size: 17px;
        }
        .post-content :global(h2) {
          font-size: 24px;
          margin: 35px 0 15px;
          color: var(--text-light);
        }
        .post-content :global(h3) {
          font-size: 20px;
          margin: 25px 0 12px;
          color: var(--text-light);
        }
        .post-content :global(p) {
          margin-bottom: 18px;
          color: var(--text-gray);
        }
        .post-content :global(ul), .post-content :global(ol) {
          margin: 15px 0 25px 25px;
          color: var(--text-gray);
        }
        .post-content :global(li) {
          margin-bottom: 10px;
        }
        .post-content :global(table) {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .post-content :global(td) {
          padding: 10px 15px;
          border: 1px solid var(--border-color);
          color: var(--text-gray);
        }
        .share-section {
          margin-top: 50px;
          padding-top: 30px;
          border-top: 1px solid var(--border-color);
          text-align: center;
        }
        .share-section h3 {
          color: var(--text-light);
          margin-bottom: 15px;
        }
        .share-buttons {
          display: flex;
          justify-content: center;
          gap: 12px;
        }
        .share-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          color: white;
          font-size: 16px;
          transition: transform 0.2s, opacity 0.2s;
        }
        .share-btn:hover { transform: scale(1.1); }
        .share-btn.facebook { background: #1877f2; }
        .share-btn.twitter { background: #1da1f2; }
        .share-btn.linkedin { background: #0a66c2; }
        .share-btn.copy { background: var(--accent); }
        .related-cta {
          margin-top: 50px;
          padding: 40px;
          background: linear-gradient(135deg, var(--accent) 0%, #2563eb 100%);
          border-radius: 16px;
          text-align: center;
          color: white;
        }
        .related-cta h3 {
          font-size: 24px;
          margin-bottom: 10px;
        }
        .related-cta p {
          opacity: 0.9;
          margin-bottom: 20px;
        }
        .cta-btn {
          display: inline-block;
          background: white;
          color: var(--accent);
          padding: 12px 28px;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.2s;
        }
        .cta-btn:hover { transform: translateY(-2px); }

        @media (max-width: 768px) {
          .hero-image { height: 300px; }
          .hero-overlay { padding: 25px; }
          .hero-content h1 { font-size: 26px; }
          .container { padding: 30px 15px 60px; }
          .post-content { font-size: 16px; }
          .related-cta { padding: 30px 20px; }
        }
      `}</style>
    </>
  );
}
