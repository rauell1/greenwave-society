import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import SigningActions from "./SigningActions";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const db  = getDb();
  const sig = await db.constitutionSignature.findUnique({ where: { token }, include: { leader: true, version: true } });
  if (!sig) return { title: "Invalid Link" };
  return { title: `Constitution Signing | ${sig.leader.name} | Greenwave Society` };
}

export default async function SigningPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const db  = getDb();
  const sig = await db.constitutionSignature.findUnique({ where: { token }, include: { leader: true, version: true } });
  if (!sig) notFound();

  return (
    <div className="min-h-screen bg-[oklch(0.975_0.015_85)]">
      <header className="bg-[#1A5C38] text-white">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center gap-3">
          <img src="/logo.png" alt="Greenwave Society" className="h-10 w-10 rounded-xl object-contain" />
          <div>
            <p className="font-bold font-serif tracking-wide">GREENWAVE SOCIETY</p>
            <p className="text-green-200 text-xs">Executive Leadership Constitution &mdash; Signing Portal</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1A5C38] font-serif">Dear {sig!.leader.name},</h1>
          <p className="text-gray-600 text-sm mt-1">{sig!.leader.role}</p>
          {sig!.status !== "pending" ? (
            <div className={`mt-4 px-5 py-4 rounded-xl border text-sm font-medium ${sig!.status === "signed" ? "bg-green-50 border-green-300 text-green-800" : "bg-red-50 border-red-300 text-red-800"}`}>
              {sig!.status === "signed"
                ? `You signed this Constitution on ${new Date(sig!.signedAt!).toLocaleDateString("en-KE", { day: "2-digit", month: "long", year: "numeric" })}. Thank you for your commitment to the Greenwave Society mission.`
                : "You declined to sign this Constitution. Your decision has been recorded. Please contact info@greenwavesociety.org if you wish to discuss this further."}
            </div>
          ) : (
            <p className="mt-3 text-gray-600 text-sm leading-relaxed">
              You have been invited to review and sign the Greenwave Society Executive Leadership Constitution.
              Please read the document carefully in full before signing. By signing, you formally accept all
              obligations and responsibilities set out herein.
            </p>
          )}
        </div>

        {/* Constitution Document */}
        <div className="bg-white rounded-2xl shadow border border-gray-200 mb-8 overflow-hidden">
          <div className="bg-[#1A5C38] px-8 py-6 text-center">
            <p className="text-white font-bold text-xl font-serif tracking-wide">GREENWAVE SOCIETY</p>
            <p className="text-green-200 text-sm mt-1">{(sig!.version?.title ?? "EXECUTIVE LEADERSHIP CONSTITUTION").toUpperCase()}</p>
            <p className="text-green-300 text-xs mt-0.5 italic">{sig!.versionTag} &bull; June 2026 &bull; Nairobi, Kenya</p>
          </div>

          {sig!.version?.content ? (
            <div
              className="px-10 py-10"
              style={{ fontFamily: "Times New Roman, serif", textAlign: "justify", fontSize: "15px", lineHeight: "1.75", color: "#111" }}
              dangerouslySetInnerHTML={{ __html: sig!.version.content }}
            />
          ) : (
          <div className="px-10 py-10 space-y-8" style={{ fontFamily: "Times New Roman, serif", textAlign: "justify", fontSize: "15px", lineHeight: "1.75", color: "#111" }}>

            <Sect title="PREAMBLE">
              <p>We, the founding Executive Leaders of Greenwave Society, a Kenya-based non-profit youth organization dedicated to accelerating climate action and empowering youth as global changemakers, do hereby establish this Constitution as the governing covenant of our Executive Leadership Team.</p>
              <p>Guided by our mission to foster sustainable community development through international cooperation, and rooted in the principles of the 2030 Sustainable Development Agenda, we recognize that the strength of our organization begins with the integrity, commitment, and accountability of those who lead it.</p>
              <p>This Constitution is not merely a procedural document. It is a personal and collective pledge, a declaration that each Executive Leader freely and sincerely commits to the people we serve, to our fellow leaders, and to the planet we are called to protect and restore. By affixing our signatures hereto, we bind ourselves to the obligations, standards, and values set forth in this instrument.</p>
            </Sect>

            <Sect title="ARTICLE I: NAME, NATURE, AND REGISTERED CONTACT">
              <p>The organization operating under this Constitution shall be known as the <strong>Greenwave Society</strong> (hereinafter referred to as &ldquo;the Society&rdquo; or &ldquo;the Organization&rdquo;).</p>
              <KV k="Type of Organization" v="Youth-led Non-Governmental Organization (NGO)" />
              <KV k="Country of Primary Operation" v="Kenya" />
              <KV k="Official Website" v="greenwavesociety.org" />
              <KV k="Email" v="info@greenwavesociety.org" />
              <KV k="Telephone" v="+254 700 519 130" />
            </Sect>

            <Sect title="ARTICLE II: MISSION, VISION, AND CORE VALUES">
              <SubH>Mission</SubH>
              <p>To accelerate climate action, empower youth as global changemakers, and foster sustainable community development through international cooperation.</p>
              <SubH>Vision</SubH>
              <p>A world where humanity and planetary ecosystems coexist in harmony, achieved through the full and faithful implementation of the 2030 Sustainable Development Agenda.</p>
              <SubH>Core Strategic Pillars</SubH>
              <Bul items={[
                "Climate and Ecosystem Protection: Advancing Sustainable Development Goals 13, 14, and 15 through ecosystem restoration, biodiversity conservation, and localized action.",
                "Youth Leadership and Inclusion: Empowering individuals aged 15 to 35 through education, mentorship, and skills development, in furtherance of Sustainable Development Goals 4, 5, 8, and 10.",
                "Community-Led Development: Supporting grassroots water stewardship and community resilience initiatives in furtherance of Sustainable Development Goals 6 and 11.",
                "Global Partnerships and Accountability: Building transparent, strategic collaborations in furtherance of Sustainable Development Goal 17.",
              ]} />
            </Sect>

            <Sect title="ARTICLE III: EXECUTIVE LEADERSHIP STRUCTURE">
              <p>The Executive Leadership Team of the Society shall comprise six (6) individuals, each bearing distinct responsibilities in furtherance of the organizational mission:</p>
              <div className="my-3 overflow-hidden rounded-lg border border-gray-200 text-sm">
                <table className="w-full">
                  <thead><tr className="bg-[#1A5C38] text-white"><th className="text-left px-4 py-2.5">Leader</th><th className="text-left px-4 py-2.5">Title</th></tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {([ ["Martin Kyalo","Chief Executive Officer (CEO)"],["Njeri Njoroge","Chief Operating Officer (COO)"],["Eugene Shadrack","Chief Innovation Officer (CIO)"],["Mark Katana","Chief Strategy and Well-being Officer (CSWO)"],["Roy Okola Otieno","Head of Design"],["Roy John","Design Assistant"] ] as [string,string][]).map(([n,r],i)=>(
                      <tr key={n} className={i%2===0?"bg-green-50/40":"bg-white"}>
                        <td className="px-4 py-2 font-semibold">{n}</td>
                        <td className="px-4 py-2 text-gray-600">{r}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>No Executive position shall be held concurrently by the same individual unless approved by unanimous vote of the remaining Executive Leaders.</p>
            </Sect>

            <Sect title="ARTICLE IV: EXECUTIVE ROLES AND RESPONSIBILITIES">
              {[
                { name:"1.  Chief Executive Officer (CEO)", holder:"Martin Kyalo", intro:"The Chief Executive Officer serves as the highest-ranking executive of the Society and bears ultimate responsibility for the strategic direction, external representation, and overall performance of the Organization.", duties:["Drive organizational vision and long-term strategy in alignment with the mission and values of the Society.","Ensure the financial stability and long-term sustainability of the Organization.","Represent the brand and mission of the Society at high-level forums, partnerships, and public engagements.","Lead board engagement, stakeholder relations, and all senior strategic decision-making processes.","Provide final executive authorization on matters of organizational policy, public communication, and resource allocation above prescribed thresholds."] },
                { name:"2.  Chief Operating Officer (COO)", holder:"Njeri Njoroge", intro:"The Chief Operating Officer oversees all internal operations, organizational workflows, and institutional well-being to ensure effective and efficient implementation of the mission.", duties:["Manage and coordinate the daily operations and internal systems of the Organization.","Develop, implement, and review operational policies, procedures, and frameworks.","Support the Chief Executive Officer in the execution of strategic initiatives.","Foster a culture of efficiency, accountability, and organizational well-being across the Executive Team.","Serve as the principal organizational secretary, responsible for the maintenance of official records and documentation of Executive decisions."] },
                { name:"3.  Chief Innovation Officer (CIO)", holder:"Eugene Shadrack", intro:"The Chief Innovation Officer leads forward-looking growth initiatives, with particular focus on entrepreneurial modeling, technology integration, and the development of sustainable revenue streams.", duties:["Design, test, pilot, and scale innovative revenue streams and social enterprise business models.","Spearhead entrepreneurial modeling to align social impact objectives with financial sustainability.","Oversee the integration of modern and emerging technologies to optimize organizational impact and community outreach.","Support the Executive Team in identifying, developing, and securing strategic funding, grants, and venture opportunities."] },
                { name:"4.  Chief Strategy and Well-being Officer (CSWO)", holder:"Mark Katana", intro:"The Chief Strategy and Well-being Officer leads long-term community growth, drives mobilization efforts, and cultivates a supportive and high-performing internal organizational culture.", duties:["Design and execute strategic initiatives for community growth, outreach, and sustainable scaling of programs.","Spearhead community mobilization campaigns and advocate for social transformation, equity, and empowerment.","Nurture the internal organizational culture through practices that support team cohesion, professional development, and mental wellness.","Act as a bridge between community needs and organizational strategy to maximize grassroots impact."] },
                { name:"5.  Head of Design", holder:"Roy Okola Otieno", intro:"The Head of Design leads the visual identity of the Society, oversees all branding strategies, and ensures design consistency across all organizational platforms.", duties:["Formulate and implement comprehensive branding guidelines to maintain a unified and professional visual identity.","Spearhead visual storytelling initiatives that effectively communicate the impact, values, and community milestones of the Society.","Maintain design consistency across all digital, print, and social media assets.","Direct, mentor, and oversee the work of the Design Assistant."] },
                { name:"6.  Design Assistant", holder:"Roy John", intro:"The Design Assistant supports the Head of Design in executing visual strategy, producing creative assets, and maintaining the highest standards of design quality.", duties:["Assist in the production and formatting of social media graphics, digital media, and print materials under direct guidance.","Help maintain design consistency by strictly adhering to established branding rules, guidelines, and approved templates.","Organize, manage, and maintain the internal repository of creative files, design assets, stock photography, and templates.","Support visual storytelling by editing, resizing, and preparing multimedia content for publication."] },
              ].map(r => (
                <div key={r.name} className="mt-4">
                  <p className="font-bold">{r.name}</p>
                  <p className="text-sm text-gray-500 mb-1"><strong>Name:</strong> {r.holder}</p>
                  <p className="mb-2">{r.intro}</p>
                  <Bul items={r.duties} />
                </div>
              ))}
            </Sect>

            <Sect title="ARTICLE V: MEETING ATTENDANCE AND ACCOUNTABILITY POLICY">
              <p>Meetings of the Executive Leadership Team constitute the primary forum through which the collective mission of the Society is advanced, decisions are made, and accountability is maintained. Attendance at all scheduled Executive Meetings is a fundamental and non-negotiable obligation of Executive membership.</p>
              <SubH>Section 5.1  Scheduled Meetings</SubH>
              <p>All six (6) Executive Leaders shall be required to attend every scheduled Executive Leadership Meeting. Meeting schedules shall be communicated no fewer than seventy-two (72) hours in advance through official communication channels.</p>
              <SubH>Section 5.2  Mandatory Attendance</SubH>
              <p>Attendance at all Executive Meetings is mandatory. Each Leader is expected to be punctual, adequately prepared, and fully present for the entire duration of every scheduled meeting. Habitual lateness shall be treated with the same gravity as absence.</p>
              <SubH>Section 5.3  Excused Absence Protocol</SubH>
              <Num items={["The Leader must communicate his or her inability to attend prior to the commencement of the meeting.","Communication must be directed to the Chief Operating Officer or the Chief Executive Officer through an official organizational channel, being the designated WhatsApp group, official email address, or direct telephone call.","A formal apology and a brief but clear reason for the absence must be provided at the time of communication.","The absent Leader bears personal responsibility for reviewing all decisions, resolutions, and action items arising from the missed meeting within twenty-four (24) hours of the conclusion of the meeting.","A pattern of repeated excused absences, even where properly communicated, may be reviewed by the Executive Team as a concern regarding a Leader's commitment and capacity to serve."]} />
              <SubH>Section 5.4  Three-Strike Rule: Consecutive Absences Without Apology</SubH>
              <div className="my-3 bg-amber-50 border-l-4 border-amber-500 px-5 py-4 rounded-r-lg text-sm font-semibold text-amber-900">
                Three (3) consecutive absences from scheduled Executive Meetings without prior apology or any form of communication shall constitute a formal declaration of disengagement from the Executive Leadership Team and shall trigger the formal review process set out in this Section.
              </div>
              <Num items={["The Chief Executive Officer or the Chief Operating Officer shall issue a written notice of concern to the Leader in question within five (5) working days of the third consecutive unexcused absence.","The Leader shall have five (5) working days from the date of receipt of such notice to respond in writing, providing a full explanation of absence and a commitment regarding future attendance.","An emergency Executive Meeting shall be convened within ten (10) working days of the third consecutive unexcused absence to formally review the situation.","The Executive Team shall vote by simple majority to determine whether to retain the Leader, suspend the Leader pending further review, or release the Leader from Executive duties. The Leader in question shall not vote on any resolution concerning his or her own position.","All proceedings, notices, responses, and resolutions arising from this process shall be formally documented and stored as part of the official records of the Organization."]} />
              <SubH>Section 5.5  Commitment Standard</SubH>
              <p>Each Executive Leader acknowledges and affirms that consistent attendance is a visible and measurable expression of his or her commitment to the mission of Greenwave Society, to the communities the Society serves, and to the collective responsibility shared by all Executive Leaders. Absence without prior communication is an act that undermines collective progress and will not be condoned.</p>
            </Sect>

            <Sect title="ARTICLE VI: CODE OF CONDUCT AND ETHICAL STANDARDS">
              <Bul items={["Act with integrity, transparency, and respect in all organizational interactions, whether internal or external.","Maintain strict confidentiality with respect to sensitive organizational information, including financial data, personnel matters, strategic plans, and donor or partner information.","Proactively identify, disclose, and appropriately manage any conflict of interest, whether actual, potential, or perceived, that may arise in the course of fulfilling their duties.","Refrain from making public statements or entering into agreements on behalf of the Society without prior written authorization from the Chief Executive Officer.","Treat all members, partners, volunteers, beneficiaries, and community representatives with dignity, fairness, and respect, without discrimination on any ground.","Refrain from any conduct that may bring the name, reputation, mission, or goodwill of Greenwave Society into disrepute."]} />
            </Sect>

            <Sect title="ARTICLE VII: DECISION-MAKING AND GOVERNANCE">
              <Bul items={["All strategic decisions shall be made by consensus where reasonably achievable. Where consensus cannot be reached, a resolution shall be adopted by a simple majority vote of four (4) out of the six (6) Executive Leaders.","The Chief Executive Officer shall hold a casting vote in the event of a tied vote among the Executive Team.","No individual Executive Leader may unilaterally commit organizational financial resources exceeding ten thousand Kenya Shillings (KES 10,000) without prior written approval from at least two (2) other Executive Leaders, one of whom must be either the Chief Executive Officer or the Chief Operating Officer.","All major decisions, resolutions, and action items arising from Executive Meetings shall be formally documented in official meeting minutes, prepared and authenticated by the Chief Operating Officer.","This Constitution may be amended only by unanimous written vote of all six (6) serving Executive Leaders in accordance with the provisions of Article IX."]} />
            </Sect>

            <Sect title="ARTICLE VIII: CONFLICT RESOLUTION">
              <Num items={["The parties in conflict shall first make a genuine and good-faith effort to resolve the matter privately between themselves within forty-eight (48) hours of the conflict arising.","In the event that the matter remains unresolved, it shall be escalated to the Chief Executive Officer and the Chief Operating Officer, jointly, who shall act as mediators in facilitating a fair and confidential resolution.","In the event that mediation does not produce resolution, a full Executive Meeting shall be convened within seven (7) working days specifically for the purpose of collective review and resolution of the dispute.","All parties shall engage in every stage of the conflict resolution process in good faith, with respect, civility, and strict confidentiality."]} />
            </Sect>

            <Sect title="ARTICLE IX: REVIEW AND AMENDMENT">
              <Bul items={["Annually, at the first scheduled Executive Meeting of each calendar year.","Upon the addition, resignation, removal, or departure of any Executive Leader.","Upon a formal written request submitted by any two (2) or more Executive Leaders."]} />
              <p>No amendment shall take effect unless approved by the unanimous written consent of all serving Executive Leaders. All amended versions shall be re-executed by all serving Executive Leaders within fourteen (14) days of the adoption of any amendment.</p>
            </Sect>

            <Sect title="ARTICLE X: EXECUTIVE COMMITMENT PLEDGE">
              <p>We, the undersigned Executive Leaders of Greenwave Society, having individually and collectively read, deliberated upon, and understood the full terms and provisions of this Constitution, do hereby freely, voluntarily, and sincerely make the following pledge:</p>
              <blockquote className="my-5 border-l-4 border-[#1A5C38] pl-6 italic text-gray-700 leading-relaxed">
                &ldquo;I commit to serve the mission of Greenwave Society with integrity, consistency, and purpose. I will attend every scheduled Executive Meeting, communicate proactively and in advance when genuinely unable to attend, and at all times uphold the values, ethical standards, and accountability obligations set forth in this Constitution. I understand that my commitment is not only to this Organization and to my fellow Leaders, but to the youth, the communities, and the ecosystems we are collectively called to protect, empower, and restore.&rdquo;
              </blockquote>
            </Sect>

          </div>
          )}
        </div>

        <SigningActions token={token} status={sig!.status} leaderName={sig!.leader.name} />

        <p className="text-xs text-gray-400 mt-6 text-center">
          This signing link is unique to {sig!.leader.name} and is legally binding upon submission.
          Greenwave Society &bull; greenwavesociety.org
        </p>
      </main>
    </div>
  );
}

function Sect({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{ fontWeight: "bold", fontSize: "13px", color: "#1A5C38", borderBottom: "2px solid #1A5C38", paddingBottom: "4px", marginBottom: "12px", letterSpacing: "0.04em" }}>{title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>{children}</div>
    </div>
  );
}

function SubH({ children }: { children: React.ReactNode }) {
  return <p style={{ fontWeight: "bold", color: "#1A3D26", marginTop: "12px", marginBottom: "2px" }}>{children}</p>;
}

function KV({ k, v }: { k: string; v: string }) {
  return <p><strong>{k}:</strong>&nbsp;&nbsp;{v}</p>;
}

function Bul({ items }: { items: string[] }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: "6px 0", display: "flex", flexDirection: "column", gap: "5px" }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: "flex", gap: "10px" }}>
          <span style={{ color: "#1A5C38", flexShrink: 0 }}>&#x2022;</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Num({ items }: { items: string[] }) {
  return (
    <ol style={{ listStyle: "none", padding: 0, margin: "6px 0", display: "flex", flexDirection: "column", gap: "5px" }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: "flex", gap: "10px" }}>
          <span style={{ color: "#1A5C38", fontWeight: "bold", flexShrink: 0 }}>{i + 1}.</span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}
