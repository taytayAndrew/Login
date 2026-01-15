import React from 'react';
import { Tag, Tooltip } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

interface Label {
    id: string;
    name: string;
    color: string;
    description?: string;
}

interface LabelBadgeProps {
    label: Label;
    closable?: boolean;
    onClose?: (labelId: string) => void;
    size?: 'small' | 'default' | 'large';
    style?: React.CSSProperties;
}

const LabelBadge: React.FC<LabelBadgeProps> = ({
    label,
    closable = false,
    onClose,
    size = 'default',
    style,
}) => {
    const handleClose = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onClose) {
            onClose(label.id);
        }
    };

    const getFontSize = () => {
        switch (size) {
            case 'small':
                return '12px';
            case 'large':
                return '16px';
            default:
                return '14px';
        }
    };

    const getPadding = () => {
        switch (size) {
            case 'small':
                return '2px 6px';
            case 'large':
                return '6px 12px';
            default:
                return '4px 8px';
        }
    };

    const tagStyle: React.CSSProperties = {
        fontSize: getFontSize(),
        padding: getPadding(),
        borderRadius: '4px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        ...style,
    };

    const badge = (
        <Tag
            color={label.color}
            closable={closable}
            closeIcon={<CloseOutlined style={{ fontSize: '10px' }} />}
            onClose={handleClose}
            style={tagStyle}
        >
            {label.name}
        </Tag>
    );

    // If label has description, wrap in tooltip
    if (label.description) {
        return (
            <Tooltip title={label.description} placement="top">
                {badge}
            </Tooltip>
        );
    }

    return badge;
};

export default LabelBadge;
