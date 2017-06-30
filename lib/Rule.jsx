import React from 'react';

export default class Rule extends React.Component {
    static get defaultProps() {
        return {
            id: null,
            parentId: null,
            field: null,
            operator: null,
            value: null,
            schema: null
        };
    }

    render() {
        const {field, operator, value, schema: {fields, controls, getOperators, getLevel, classNames}} = this.props;
      
        return (
            <div className={`rule ${classNames.rule}`}>
                {
                    React.createElement(controls.fieldSelector,
                        {
                            options: fields,
                            value: field,
                            className: `rule-fields ${classNames.fields}`,
                            handleOnChange: this.onFieldChanged 
                           
                        }
                    )
                }
                {
                    React.createElement(controls.operatorSelector,
                        {
                            field: field,
                            options: getOperators(field),
                            value: operator,
                            className: `rule-operators ${classNames.operators}`,
                            handleOnChange: this.onOperatorChanged
                            
                        }
                    )
                }
                {
                    React.createElement(controls.valueEditor,
                        {
                            field: field,
                            operator: operator,
                            value: value,
                            className: `rule-value ${classNames.value}`,
                            handleOnChange: this.onValueChanged
                            
                        }
                    )
                }
                {
                    React.createElement(controls.removeRuleAction,
                    {
                        label: 'x',
                        className: `rule-remove ${classNames.removeRule}`,
                        handleOnClick: this.removeRule
                    
                    })
                }
                {
                    React.createElement(controls.duplicateRuleAction,
                    {
                        label: '+',
                        className: `rule-duplicate ${classNames.duplicateRule}`,
                        handleOnClick: this.duplicateRule
                    
                    })
                }
            </div>
        );
    }

    onFieldChanged = (value) => {
        this.onElementChanged('field', value);
    }

    onOperatorChanged = (value) => {
        this.onElementChanged('operator', value);
    }

    onValueChanged = (value) => {
        this.onElementChanged('value', value);
    }

    onElementChanged = (property, value) => {
        console.log("Element Changed",property,value);
        const {id,parentId, schema: {onPropChange}} = this.props;

        onPropChange(property, value, id, parentId);
    }

    removeRule = (event) => {
        event.preventDefault();
        event.stopPropagation();

        this.props.schema.onRuleRemove(this.props.id, this.props.parentId);
    }
    duplicateRule = (event) => {
        event.preventDefault();
        event.stopPropagation();

        this.props.schema.onDuplicateRule(this.props, this.props.parentId);
    }


}
