const plans = [
    {
        planName: 'VassuTech™ FREE',
        code: { monthly: 'freeplan', yearly: 'freeplan' },
        img: 'free.png',
        currency: '',
        monthlyPrice: 'Free',
        yearlyPrice: 'Free',
        subtitle: 'Free Unlimited E-signatures, Forever.',
        btn: { text: 'Subscribe', color: 'op-btn-primary' },
        url: '',
        target: '_blank',
        benefits: [
            'Unlimited digital signatures',
            'Sign documents yourself',
            'Request signatures from others',
            'Unlimited templates',
            '14 field types',
            'Automatic e-signatures',
            'Completion certificates',
            'Send in order',
            'Organize docs in VassuTech™ Drive',
            'Document templates',
            'Import from Dropbox',
            'Contact book',
            'Document expiry support',
            'Decline document support',
            'Email notifications',
            'Public profiles',
            'And much more',
        ],
        yearlyBenefits: [
            'Unlimited digital signatures',
            'Sign documents yourself',
            'Request signatures from others',
            'Unlimited templates',
            '14 field types',
            'Automatic e-signatures',
            'Completion certificates',
            'Send in order',
            'Organize docs in VassuTech™ Drive',
            'Document templates',
            'Import from Dropbox',
            'Contact book',
            'Document expiry support',
            'Decline document support',
            'Email notifications',
            'Public profiles',
            'And much more',
        ],
    },
    {
        planName: 'VassuTech™ PROFESSIONAL',
        code: {
            monthly: 'professional-monthly',
            yearly: 'professional-yearly',
        },
        img: 'professional.png',
        currency: '$',
        monthlyPrice: '29.99',
        yearlyPrice: `9.99<sup style="font-size: 17px;">/month</sup>`,
        subtitle: 'Exclusive Access to advanced features.',
        btn: { text: 'Subscribe', color: 'op-btn-primary' },
        url: 'https://vassutech.com',
        yearlyUrl: 'https://vassutech.com',
        target: '_self',
        benefits: [
            'Everything in VassuTech™ free',
            'Field validations',
            'Regular expression validations',
            'Organize docs in VassuTech™ Drive',
            'Webhooks',
            'Zapier integration',
            'API Access',
            'upto 100 API signatures',
            'Custom email templates',
            'Connect your own Gmail or SMTP account for sending emails',
            'Auto reminders',
            'Bulk send (upto 100 docs)',
            'Premium Public profile usernames',
            'Enforce email-based verification to confirm signer identity',
            'Embedded signing',
        ],
        yearlyBenefits: [
            'Everything in VassuTech™ free',
            'Field validations',
            'Regular expression validations',
            'Organize docs in VassuTech™ Drive',
            'Webhooks',
            'Zapier integration',
            'API Access',
            'upto 240 API signatures',
            'Custom email templates',
            'Connect your own Gmail or SMTP account for sending emails',
            'Auto reminders',
            'Bulk send (upto 240 docs)',
            'Premium Public profile usernames',
            'Enforce email-based verification to confirm signer identity',
            'Embedded signing',
        ],
    },
    {
        planName: 'VassuTech™ TEAMS',
        code: { monthly: 'teams-monthly', yearly: 'teams-yearly' },
        img: 'teams.png',
        currency: '$',
        monthlyPrice: `39.99<sup style="font-size: 17px;">/user</sup>`,
        yearlyPrice: `19.99<sup style="font-size: 17px;">/user/month</sup>`,
        subtitle: 'Exclusive Access to advanced features.',
        btn: { text: 'Subscribe', color: 'op-btn-accent' },
        url: 'https://vassutech.com',
        yearlyUrl: 'https://vassutech.com',
        target: '_self',
        benefits: [
            'Everything in VassuTech™ professional',
            'upto 100 API signatures',
            'Teams and Organizations',
            'Share Templates with teams',
            'Share Templates with individuals',
            'BYOC - Store your documents in your own cloud storage',
            'DocumentId removal from signed docs',
            'Bulk send (upto 100 docs)',
            'Request Payments (coming soon)',
            'Mobile app (coming soon)',
        ],
        yearlyBenefits: [
            'Everything in VassuTech™ professional',
            'upto 500 API signatures',
            'Teams and Organizations',
            'Share Templates with teams',
            'Share Templates with individuals',
            'BYOC - Store your documents in your own cloud storage',
            'DocumentId removal from signed docs',
            'Bulk send (upto 500 docs)',
            'Request Payments (coming soon)',
            'Mobile app (coming soon)',
        ],
    },
    {
        planName: 'VassuTech™ ENTERPRISE',
        img: 'enterprise.png',
        currency: '',
        monthlyPrice: `<p style="font-size: 22px;">Request Price</p>`,
        yearlyPrice: `<p style="font-size: 22px;">Request Price</p>`,
        subtitle: 'Scalable Features with priority support.',
        btn: { text: 'Contact us', color: 'op-btn-primary' },
        url: 'https://vassutech.com/',
        target: '_blank',
        benefits: [
            'All features',
            'Custom domain',
            'Custom branding',
            'Uptime SLA',
            'SSO support',
            'Priority support',
        ],
        yearlyBenefits: [
            'All features',
            'Custom domain',
            'Custom branding',
            'Uptime SLA',
            'SSO support',
            'Priority support',
        ],
    },
];

export const validplan = {
    'team-weekly': true,
    'team-yearly': true,
    'teams-monthly': true,
    'teams-yearly': true,
    'enterprise-monthly': true,
    'enterprise-yearly': true,
};
export const paidUrl = (plan) => {
    const teamperiod = {
        'team-weekly': 'monthly',
        'team-yearly': 'yearly',
        'teams-monthly': 'monthly',
        'teams-yearly': 'yearly',
    };
    const period = teamperiod[plan] || '';
    if (period) {
        const extUser =
            localStorage.getItem('Extand_Class')! &&
            JSON.parse(localStorage.getItem('Extand_Class')!)?.[0];
        const user = {
            name: extUser?.Name,
            email: extUser?.Email,
            company: extUser?.Company,
            phone: extUser?.Phone,
        };
        const fullname = user && user.name ? user.name.split(' ') : '';
        const firstname = fullname?.[0]
            ? 'first_name=' + encodeURIComponent(fullname?.[0])
            : '';
        const lastname = fullname?.[1]
            ? '&last_name=' + encodeURIComponent(fullname?.[1])
            : '';
        const name = firstname ? firstname + lastname : '';
        const email =
            user && user.email
                ? '&email=' + encodeURIComponent(user.email)
                : '';
        const company =
            user && user.company
                ? '&company_name=' + encodeURIComponent(user.company)
                : '';
        const phone =
            user && user.phone
                ? '&mobile=' + encodeURIComponent(user.phone)
                : '';
        const allowedUsers =
            localStorage.getItem('allowedUsers')! &&
            Number(localStorage.getItem('allowedUsers')!) > 0
                ? Number(localStorage.getItem('allowedUsers')!) - 1
                : '';
        const quantity = allowedUsers
            ? `addon_code%5B0%5D=extra-teams-users-${period}&addon_quantity%5B0%5D=${allowedUsers}&`
            : '';

        const details =
            '?shipping_country_code=US&billing_country_code=US&billing_state_code=CA&' +
            quantity +
            name +
            email +
            company +
            phone;

        if (user) {
            localStorage.setItem('userDetails', JSON.stringify(user));
        }
        const url = {
            monthly: 'https://vassutech.com',
            yearly: 'https://vassutech.com',
        };

        const planurl = url[period] + details;
        return planurl;
    } else {
        return '/subscription';
    }
};
export default plans;
