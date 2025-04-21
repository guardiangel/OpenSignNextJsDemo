import { FC } from 'react';
import { makeStyles } from 'tss-react/mui';

//If a variable is declared and unused append _ to it to avoid linting errors. eg: _theme
const useStyles = makeStyles()((_theme) => ({
    main: {
        backgroundColor: 'rgba(37, 137, 255, 0.10)',
        width: '100%',
    },
}));

//Export interfaces based on necessisity
export interface IBaseTemplate {
    sampleTextProp: string;
}

const BaseTemplate: FC<IBaseTemplate> = ({ sampleTextProp }) => {
    const { classes } = useStyles();
    return <div className={classes.main}>{sampleTextProp}</div>;
};

export default BaseTemplate;
