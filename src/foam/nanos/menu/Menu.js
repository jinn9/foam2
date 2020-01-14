/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'Menu',

  implements: [
    'foam.nanos.auth.Authorizable',
    'foam.nanos.auth.EnabledAware'
  ],

  tableColumns: [
    'enabled',
    'id',
    'parent',
    'label',
    'order'
  ],

  imports: [
    'lastMenuLaunchedListener?'
  ],

  javaImports: [
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException'
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      tableWidth: 280
    },
    {
      class: 'String',
      name: 'label',
      documentation: 'Menu label.'
    },
    {
      class: 'Boolean',
      name: 'enabled',
      value: true
    },
    {
      class: 'FObjectProperty',
      name: 'handler',
      documentation: 'View initialized when menu is launched.',
      view: {
        class: 'foam.u2.view.FObjectView',
        choices: [
          [ 'foam.nanos.menu.DAOMenu',      'DAO' ],
          [ 'foam.nanos.menu.DAOMenu2',      'DAO2' ],
          [ 'foam.nanos.menu.DocumentMenu', 'Document' ],
          [ 'foam.nanos.menu.DocumentFileMenu', 'External Document' ],
          [ 'foam.nanos.menu.LinkMenu',     'Link' ],
          [ 'foam.nanos.menu.ListMenu',     'List' ],
          [ 'foam.nanos.menu.SubMenu',      'Submenu' ],
          [ 'foam.nanos.menu.TabsMenu',     'Tabs' ],
          [ 'foam.nanos.menu.ViewMenu',     'View' ]
        ]
      }
    },
    {
      class: 'Int',
      name: 'order',
      documentation: 'Used to order the menu list.',
      value: 1000
    },
    {
      class: 'String',
      name: 'description',
      documentation: 'Menu item explaination.',
      displayWidth: 80
    },
    {
      class: 'String',
      name: 'icon',
      documentation: 'Icon associated to the menu item.',
      displayWidth: 80
    },
    {
      documentation: 'Predicate providing arbitrary checks, in addition to the regular menu auth checks.',
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate',
      view: {
        class: 'foam.u2.view.JSONTextView'
      },
      javaFactory: `
      return foam.mlang.MLang.TRUE;
      `,
    }
  ],

  methods: [
    function launch_(X, e) {
      this.lastMenuLaunchedListener && this.lastMenuLaunchedListener(this);
      this.handler && this.handler.launch(X, this, e);
    },
    {
      name: 'f',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      return getPredicate().f(
        x.put("MENU", this)
      );
      `
    },
    {
      name: 'authorizeOnCreate',
      javaCode: `
      AuthService auth = (AuthService) x.get("auth");
      if ( ! ( auth.check(x, "menu.create") &&
               f(x) ) ) {
//               getPredicate().f(this) ) ) {
        throw new AuthorizationException("You do not have permission to create menus.");
      }
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
      AuthService auth = (AuthService) x.get("auth");
      if ( ! ( auth.check(x, "menu.update."+getId()) &&
               f(x) ) ) {
//               getPredicate().f(this) ) ) {
        throw new AuthorizationException("You do not have permission to update this menu.");
      }
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
      AuthService auth = (AuthService) x.get("auth");
      if ( ! ( auth.check(x, "menu.delete") &&
               f(x) ) ) {
//               getPredicate().f(this) ) ) {
        throw new AuthorizationException("You do not have permission to delete menus.");
      }
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
      AuthService auth = (AuthService) x.get("auth");
      if ( ! ( auth.check(x, "menu.read."+getId()) &&
               f(x) ) ) {
//               getPredicate().f(this) ) ) {
        throw new AuthorizationException("You don't have permission to read this menu.");
      }
      `
    }
  ],

  actions: [
    {
      name: 'launch',
      code: function(X, e) {
        this.launch_(X, e);
      }
    }
  ]
});


foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.menu.Menu',
  targetModel: 'foam.nanos.menu.Menu',
  forwardName: 'children',
  inverseName: 'parent',
  sourceProperty: {
    hidden: true
  },
  targetProperty: {
    class: 'String',
    value: '',
    view: {
      class: 'foam.u2.view.ReferenceView',
      placeholder: '--'
    }
  }
});
