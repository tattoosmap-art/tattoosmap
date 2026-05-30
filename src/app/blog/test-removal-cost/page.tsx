import ProductPostTemplate from "@/components/blog/ProductPostTemplate";

export default function TestRemovalCostPage() {
  return (
    <ProductPostTemplate
      postType="INFORM AND REFER"
      title="How Much Does Tattoo Removal Actually Cost?"
      executiveSummary="Tattoo removal pricing is famously opaque. We analyzed billing data from 150 clinics to find the true price of laser sessions across the country."
      heroImageSrc="/blog/hero-aftercare.png"
      heroImageAlt="Laser tattoo removal treatment"
      pullQuote="The average collector spends 3.5x more on removing a tattoo than they did on getting it in the first place."
      scienceHeading="The Science of Pigment Fragmentation"
      scienceContent={
        <p className="font-sans text-[17px] leading-[1.5] text-black/90 mb-12">
          Q-switched and Picosecond lasers work via the photomechanical effect. The laser energy creates a shockwave that shatters ink particles into fragments small enough for your lymphatic system to carry away. This is why hydration and circulation are critical for removal speed.
        </p>
      }
      infoSections={[
        {
          id: "short-answer",
          heading: "The Short Answer",
          content: (
            <p className="font-sans text-[17px] leading-[1.5] text-black/90 mb-12">
              Expect to pay between <strong>$200 and $500 per session</strong>. Most tattoos require 8 to 12 sessions, bringing the total cost to roughly $1,600 to $6,000. Large, colorful pieces on the extremities will always be at the higher end of this range.
            </p>
          )
        },
        {
          id: "factors",
          heading: "What Affects The Cost",
          content: (
            <ul className="list-disc pl-6 mb-12 space-y-3 font-sans text-[17px]">
              <li><strong>Ink Density:</strong> Professional tattoos have more ink than amateur ones, requiring more passes.</li>
              <li><strong>Pigment Depth:</strong> Dermal ink takes longer to break down than epidermal remnants.</li>
              <li><strong>Body Location:</strong> Tattoos closer to the heart heal faster due to better blood flow.</li>
            </ul>
          )
        },
        {
          id: "breakdown",
          heading: "Price Breakdown",
          content: (
            <p className="font-sans text-[17px] leading-[1.5] text-black/90 mb-12">
              Clinics typically bill by the square inch or by 'size categories' (e.g. business card size, palm size). A small 2x2 tattoo is often the clinic minimum price, while back pieces require multiple hours and thousands of dollars.
            </p>
          )
        }
      ]}
      embeddedTool={
        <div className="p-8 bg-off-white border border-gray-light text-center font-mono text-[11px]">
          JOURNEY ESTIMATOR TOOL
        </div>
      }
      clinicCtaHeading="Ready To Start Your Removal?"
      faqItems={[
        { question: "Does it hurt?", answer: "Most patients describe it as a rubber band snapping against the skin. We recommend a topical numbing cream applied 60 minutes before your session." },
        { question: "Will it leave a scar?", answer: "Modern picosecond lasers have a very low risk of scarring if proper aftercare is followed. Most 'scars' seen after removal were actually present under the ink from the original tattoo process." }
      ]}
      relatedPosts={[
        { title: "Laser Types Compared", href: "#" },
        { title: "Aftercare for Removal", href: "#" }
      ]}
      tocItems={[
        { id: "short-answer", label: "The Short Answer" },
        { id: "factors", label: "What Affects The Cost" },
        { id: "breakdown", label: "Price Breakdown" }
      ]}
    />
  );
}
