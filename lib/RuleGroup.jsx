import React from 'react';
import Rule from './Rule';
 import update from 'immutability-helper';
export default class RuleGroup extends React.Component {
    static get defaultProps() {
        return {
            id: null,
            rules: [],
            combinator: 'and',
            schema: {},
            level: 0
        };
    }
  
    componentDidUpdate = () =>{
        this.level = 1;
    }
    render() {
      
        const { combinator, rules, schema: {combinators, controls, onRuleRemove,onDuplicateRule, isRuleGroup, getLevel, classNames } } = this.props;
       
        let level = this.level;
       
          return (
           
                <div className={`ruleGroup ${classNames.ruleGroup}`}>
                    <span className="combinator">
                {
                    React.createElement(controls.combinatorSelector,
                        {
                            options: combinators,
                            value: combinator,
                            className: `ruleGroup-combinators ${classNames.combinators}`,
                            handleOnChange: this.onCombinatorChange, 
                            rules: rules, 
                           
                        }
                    )
                }
                
                
                {
                   
                        React.createElement(controls.removeGroupAction,
                            {
                                label: 'x',
                                className: `ruleGroup-remove ${classNames.removeGroup}`,
                                handleOnClick: this.removeGroup, 
                                rules: rules, 
                               
                            }
                        ) 
                }
                
                </span>
                <div className="ruleWrapper">
                 {
                     rules.map(r=> {
                      
                         return (
                             isRuleGroup(r)
                                 ? <RuleGroup key={r.id}
                                              id={r.id}
                                              schema={this.props.schema}
                                              
                                              combinator={r.combinator}
                                              rules={r.rules}/>
                                 : <Rule key={r.id}
                                         id={r.id}
                                         field={r.field}
                                         value={r.value}
                                         operator={r.operator}
                                         schema={this.props.schema}
                                         parentId={this.props.id}
                                         onRuleRemove={onRuleRemove}
                                         onDuplicateRule={onDuplicateRule}/>
                         );
                     })
                 }
                 
                 {
                    React.createElement(controls.addRuleAction,
                        {
                            label: '+Rule',
                            className: `ruleGroup-addRule ${classNames.addRule}`,
                            handleOnClick: this.addRule, 
                            rules: rules, 
                        
                        }
                    )
                 }
                 </div>
                 
            </div> 
            
             
        );
    
       
    }

    hasParentGroup() {
        return this.props.parentId;
    }

    onCombinatorChange = (value) => {
        const {onPropChange} = this.props.schema;

        onPropChange('combinator', value, this.props.id);
    }

    addRule = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const {createRule, onRuleAdd} = this.props.schema;

        const newRule = createRule();
        onRuleAdd(newRule, this.props.id)
    }
    duplicateRule = (event, rule) => {
        console.log("DUP fired");
        event.preventDefault();
        event.stopPropagation();

        const {createRule, onRuleAdd} = this.props.schema;

        const newRule = createRule();
        //onRuleAdd(newRule, this.props.id)
    }

    addGroup = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const {createRuleGroup, onGroupAdd} = this.props.schema;
        const newGroup = createRuleGroup();
       
        const id = update(this.props.id,{
            id: {$set: newGroup.id}
        })
        
        onGroupAdd(newGroup, newGroup.id)
    }

    removeGroup = (event) => {
        event.preventDefault();
        event.stopPropagation();

        this.props.schema.onGroupRemove(this.props.id, this.props.parentId);
    }


}
