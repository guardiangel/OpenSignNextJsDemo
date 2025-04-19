import { useTranslation } from 'react-i18next';
import { openInNewTab } from '../constant/Methods';

function Upgrade({ message }) {
    const { t } = useTranslation();
    return (
        <sup>
            <span
                onClick={() => {
                    const url = window.location.origin + '/subscription';
                    openInNewTab(url, '_blank');
                }}
                className="op-link op-link-accent text-sm"
            >
                {message ? message : t('upgrade-now')}
            </span>
        </sup>
    );
}

export default Upgrade;
