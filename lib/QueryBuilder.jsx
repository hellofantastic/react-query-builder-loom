import uniqueId from 'uuid/v4';
import cloneDeep from 'lodash/cloneDeep';
import React from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import RuleGroup from './RuleGroup';
import { ActionElement, ValueEditor, ValueSelector } from './controls/index';

export default class QueryBuilder extends React.Component {
    static get defaultProps() {
        return {
            query: null,
            fields: [],
            operators: QueryBuilder.defaultOperators,
            combinators: QueryBuilder.defaultCombinators,
            controlElements: null,
            getOperators: null,
            onQueryChange: null,
            controlClassnames: null
        };
    }

    static get propTypes() {
        return {
            query: PropTypes.array,
            fields: PropTypes.array.isRequired,
            operators: PropTypes.array,
            combinators: PropTypes.array,
            controlElements: PropTypes.shape({
                addGroupAction: PropTypes.func,
                removeGroupAction: PropTypes.func,
                addRuleAction: PropTypes.func,
                removeRuleAction: PropTypes.func,
                combinatorSelector: PropTypes.func,
                fieldSelector: PropTypes.func,
                operatorSelector: PropTypes.func,
                valueEditor: PropTypes.func
            }),
            getOperators: PropTypes.func,
            onQueryChange: PropTypes.func,
            controlClassnames: PropTypes.object
        };
    }


    constructor(...args) {
        super(...args);
        this.state = {
            root: [],
            schema: {},
        };

        this.addGroup = this._notifyQueryChange.bind(this,this.addGroup);
    }

    static get defaultOperators() {

        return [
            {name: 'null', label: 'Is Null'},
            {name: 'notNull', label: 'Is Not Null'},
            {name: 'in', label: 'In'},
            {name: 'notIn', label: 'Not In'},
            {name: '=', label: '='},
            {name: '!=', label: '!='},
            {name: '<', label: '<'},
            {name: '>', label: '>'},
            {name: '<=', label: '<='},
            {name: '>=', label: '>='},
        ];
    }

    static get defaultCombinators() {

        return [
            {name: 'and', label: 'AND'},
            {name: 'or', label: 'OR'},
        ];
    }

    static get defaultControlClassnames() {
        return {
            queryBuilder: '',

            ruleGroup: '',
            combinators: '',
            addRule: '',
            addGroup: '',
            removeGroup: '',

            rule: '',
            fields: '',
            operators: '',
            value: '',
            removeRule: '',

        };
    }

    static get defaultControlElements() {
        return {
            addGroupAction: ActionElement,
            removeGroupAction: ActionElement,
            addRuleAction: ActionElement,
            removeRuleAction: ActionElement,
            combinatorSelector: ValueSelector,
            fieldSelector: ValueSelector,
            operatorSelector: ValueSelector,
            valueEditor: ValueEditor
        };
    }
    
    componentWillReceiveProps(props) {
      if (this.props.query !== props.query) {
        this.setState({ root: props.query });
      }
    }
  
    componentWillMount() {
        const {fields, operators, combinators, controlElements, controlClassnames} = this.props;
        const classNames = Object.assign({}, QueryBuilder.defaultControlClassnames, controlClassnames);
        const controls = Object.assign({}, QueryBuilder.defaultControlElements, controlElements);
        this.setState({
            root:this.getInitialQuery(),
            schema: {
                fields,
                operators,
                combinators,

                classNames,

                createRule: this.createRule.bind(this),
                createRuleGroup: this.createRuleGroup.bind(this),
                onRuleAdd: this._notifyQueryChange.bind(this, this.onRuleAdd),
                onGroupAdd: this._notifyQueryChange.bind(this, this.onGroupAdd),
                onRuleRemove: this._notifyQueryChange.bind(this, this.onRuleRemove),
                onGroupRemove: this._notifyQueryChange.bind(this, this.onGroupRemove),
                onPropChange: this._notifyQueryChange.bind(this, this.onPropChange),
                getLevel: this.getLevel.bind(this),
                isRuleGroup: this.isRuleGroup.bind(this),
                controls,
                getOperators: (...args)=>this.getOperators(...args),
            }
        });
        
    }

    getInitialQuery() {
        if(this.props.query )
            return this.props.query;
        else{
            let group = this.createRuleGroup();
            
            return [group];
           
        }     
    }

    componentDidMount() {
        this._notifyQueryChange(null);
    }

    render() {
        const {root , schema} = this.state;
       
        return (
            <div className={`queryBuilder ${schema.classNames.queryBuilder}`}>
               { 
                   root.map((r,index) => {
                    return ( 
                        <RuleGroup key={"r"+index}
                    rules={r.rules}
                    combinator={r.combinator}
                    schema={schema}
                    id={r.id}
                    />
                    )
                })
              
               }  
                {
                    React.createElement(schema.controls.addGroupAction,
                        {
                            label: '+Group',
                            className: `ruleGroup-addGroup ${schema.classNames.addGroup}`,
                            handleOnClick: this.addGroup, 
                           
                        
                        }
                    )
                }
                {/*<button onClick={this.addGroup}>Add Group</button>*/}
            </div>
        );
    }


    isRuleGroup(rule) {
        return !!(rule.combinator && rule.rules);
    }

    createRule() {
        const {fields, operators} = this.state.schema;

        return {
            id: `r-${uniqueId()}`,
            field: fields[0].name,
            value: '',
            operator: operators[0].name
        };
    }

    createRuleGroup() {
        return {
            id: `g-${uniqueId()}`,
            combinator: this.props.combinators[0].name,
            rules: [],
        };
    }

    getOperators(field) {
        if (this.props.getOperators) {
            const ops = this.props.getOperators(field);
            if (ops) {
                return ops;
            }
        }


        return this.props.operators;
    }
    searchID(nameKey, myArray){
      for (var i=0; i < myArray.length; i++) {
        //console.log("id",myArray[i].id, nameKey);
          if (myArray[i].id === nameKey) {
              return myArray[i];
          }
        }
    }
    onRuleAdd(rule, parentId) {
       // console.log("Rule add ",rule, parentId);
       // console.log("state roo", this.state.root);
        //const parent = this._findRule(parentId, this.state.root);
        const parent = this.searchID(parentId, this.state.root);
        parent.rules.push(rule);

        this.setState({root: this.state.root});
    }
    addGroup = (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        const newGroup = this.createRuleGroup();
        const starterRule = this.createRule();
        
        newGroup.rules.push(starterRule);
        //console.log("new",newGroup); 

        this.onGroupAdd(newGroup, newGroup.id)
    }
    onGroupAdd(group,second) {
        // console.log(group);
        if(!group)
        group = this.createRuleGroup();
        
        this.setState({root: this.state.root.concat(group)});
       
    }

    onPropChange(prop, value, ruleId, parentID) {
        
        if(!parentID)
            parentID = ruleId;

         //console.log("propchange", prop,value,ruleId, parentID);
         if(prop === 'combinator'){
           let group =  this.searchID(parentID, this.state.root);  
            Object.assign(group, {[prop]: value});
        }else{ 
        const rule = this._findRule(ruleId, this.state.root,parentID);
        //console.log("find rule",rule);
        Object.assign(rule, {[prop]: value});
        }
        this.setState({root: this.state.root});
    }

    onRuleRemove(ruleId, parentId) {
        //console.log("RULE REMOVE ",ruleId, parentId);
        const parent = this.searchID(parentId, this.state.root);
        const index = parent.rules.findIndex(x=>x.id === ruleId);

        parent.rules.splice(index, 1);
        this.setState({root: this.state.root});
    }

    onGroupRemove(groupId, parentId) {
       // console.log("GROUP REMOVE ",groupId, parentId);
        const parent = this.searchID(groupId, this.state.root);
        const index = this.state.root.findIndex(x=>x.id === groupId);

        this.state.root.splice(index, 1);
        this.setState({root: this.state.root});
    }
    
    getLevel(id) {
        return this._getLevel(id, 0, this.state.root)
    }
    
    _getLevel(id, index, root) {
        console.log(id, index, root);
        const {isRuleGroup} = this.state.schema;
        
        var foundAtIndex = -1;
        if(root.id === id ) {
            foundAtIndex = index; 
        } else if(isRuleGroup(root)) {
            root.rules.forEach(rule => {
                if(foundAtIndex === -1) {
                    var indexForRule = index;
                    if(isRuleGroup(rule))
                        indexForRule++;
                    foundAtIndex = this._getLevel(id, indexForRule, rule);
                }
            });
        }
        return foundAtIndex;
       
    }

    _findRule(id, root,parentID) {
        const {isRuleGroup} = this.state.schema;
        //console.log("pid",root, id, parentID);

        if(!parentID)
            parentID = id;

       // console.log("parentID",parentID);    
       
        let group =  this.searchID(parentID, this.state.root);
        //console.log("Found ",group);
       let rules = group.rules;
       
        for (const rule of rules) {
            //console.log("A rule", rule);
            if (rule.id === id ) {
                //console.log("FOUNDIT", rule);
                return rule;
            } else if (isRuleGroup(rule)) {
                //console.log("RULEGROUP");
                const subRule = this._findRule(id, rule);
                if (subRule) {
                    return subRule;
                }
            }else if(rule.combinator == true){
                return rule;
            }
        }

    }

    _notifyQueryChange(fn, ...args) {
        if (fn) {
            fn.call(this, ...args);
        }

        const {onQueryChange} = this.props;
        if (onQueryChange) {
            const query = cloneDeep(this.state.root);
            console.log("notifychange",query);
            onQueryChange(query);
        }
    }
}

