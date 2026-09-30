import InvitationEditor, {
    type InvitationEditorData,
    type InvitationEditorManagementData,
} from '@/components/invitations/invitation-editor';
import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

type Props = InvitationEditorData & InvitationEditorManagementData;

export default function InvitationsEdit({
    guests,
    guestStats,
    guestFilters,
    comments,
    commentStats,
    commentFilters,
    digitalWallets,
    ...data
}: Props) {
    const { invitation } = data;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/customer' },
        { title: 'Undangan Saya', href: '/customer/invitations' },
        { title: invitation.title, href: '#' },
    ];

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit — ${invitation.title}`} />
            <InvitationEditor
                {...data}
                back={{ href: '/customer/invitations', label: 'Undangan Saya' }}
                endpoints={{
                    update:      `/customer/invitations/${invitation.slug}`,
                    theme:       `/customer/invitations/${invitation.slug}/theme`,
                    settings:    `/customer/invitations/${invitation.slug}/settings`,
                    uploadMusic: `/customer/invitations/${invitation.slug}/upload-music`,
                    checkSlug:   '/customer/invitations/check-slug',
                }}
                management={{ guests, guestStats, guestFilters, comments, commentStats, commentFilters, digitalWallets }}
            />
        </CustomerLayout>
    );
}
