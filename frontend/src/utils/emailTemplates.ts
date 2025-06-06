interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  vertical: string;
  subject: string;
  content: string;
}

export const emailTemplates: EmailTemplate[] = [
  {
    id: 'interior-designer-intro',
    name: 'Interior Designer Introduction',
    description: 'A warm introduction highlighting smart home integration possibilities for interior design projects.',
    vertical: 'Interior Designers',
    subject: 'Enhancing Your Design Projects with Smart Home Integration',
    content: `Dear {firstName},

I came across your impressive work at {companyName} and particularly admired your expertise in {specialty}. I believe there's a great opportunity to enhance your design projects with cutting-edge smart home technology.

As a smart home integration specialist, I've helped numerous interior designers create spaces that are not only beautiful but also intelligently automated. From lighting control that accentuates your design elements to motorized window treatments that protect fine furnishings, our solutions seamlessly blend with your aesthetic vision.

Would you be interested in discussing how we could collaborate on upcoming projects? I'd love to share some examples of our recent work with other interior designers.

Best regards,
[Your name]
[Your company]`,
  },
  {
    id: 'architect-partnership',
    name: 'Architect Partnership Proposal',
    description: 'A professional proposal for architects focusing on early-stage collaboration and smart home pre-planning.',
    vertical: 'Architects',
    subject: 'Smart Home Integration Partnership Opportunity',
    content: `Dear {firstName},

I recently reviewed {companyName}'s portfolio and was impressed by your innovative approach to {specialty}. I'm reaching out to discuss how we could enhance your architectural projects with integrated smart home technology from the design phase.

Early collaboration on smart home integration can:
- Eliminate post-construction modifications
- Optimize space planning for technology
- Enhance energy efficiency through automated systems
- Create truly future-ready homes

Would you be open to a brief meeting to explore how we could add value to your upcoming projects?

Best regards,
[Your name]
[Your company]`,
  },
  {
    id: 'builder-collaboration',
    name: 'Custom Home Builder Collaboration',
    description: 'A focused proposal for custom home builders emphasizing the value of integrated smart home features.',
    vertical: 'Custom Home Builders',
    subject: 'Adding Value to Your Custom Homes with Smart Technology',
    content: `Dear {firstName},

I've been following {companyName}'s exceptional work in {specialty} and believe we could add significant value to your custom home offerings through smart home integration.

Our expertise in home automation can help you:
- Increase property values
- Differentiate your offerings
- Meet growing buyer demand for smart features
- Streamline the construction process

Would you be interested in discussing how we could collaborate to make your next custom home project even more exceptional?

Best regards,
[Your name]
[Your company]`,
  },
  {
    id: 'follow-up-template',
    name: 'General Follow-up',
    description: 'A friendly follow-up template that can be used for any professional vertical.',
    vertical: 'All',
    subject: 'Following Up: Smart Home Integration Discussion',
    content: `Dear {firstName},

I wanted to follow up on our previous conversation about integrating smart home technology into your projects at {companyName}.

I understand that {specialty} is a key focus area for you, and I'd love to show you some specific examples of how our smart home solutions could enhance your work in this area.

Would you have 15 minutes this week for a quick discussion?

Best regards,
[Your name]
[Your company]`,
  },
];

export const getTemplatesByVertical = (vertical: string): EmailTemplate[] => {
  return emailTemplates.filter(template => 
    template.vertical === vertical || template.vertical === 'All'
  );
}; 