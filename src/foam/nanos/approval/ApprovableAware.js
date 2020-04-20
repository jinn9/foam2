/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.INTERFACE({
  package: 'foam.nanos.approval',
  name: 'ApprovableAware',
  implements: [
    'foam.comics.v2.userfeedback.UserFeedbackAware',
    'foam.core.ContextAware',
    'foam.nanos.auth.LifecycleAware',
  ],

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.nanos.logger.Logger',
    'foam.nanos.approval.ApprovableAware',
    'java.util.Iterator',
    'java.util.ArrayList',
    'java.util.Arrays',
    'java.util.List',
    'java.util.Map',
  ],

  methods: [
    {
      name: 'getStringId',
      type: 'String'
    }  
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.methods.push(
          foam.java.Method.create({
            name: 'getApprovableHashKey',
            type: 'String',
            static: true,
            visibility: 'public',
            args: [
              { name: 'x', type: 'X' },
              { name: 'obj', type: 'FObject' }
            ],
            body: `
              FObject oldObj = null;
              try {
                oldObj = (obj.getClass()).newInstance();
              } catch ( Exception e ) {
                Logger logger = (Logger) x.get("logger");
                logger.error("Error instantiating : ", obj.getClass().getSimpleName(), e);
              }
              Map diff = oldObj == null ? null : oldObj.diff(obj);
              StringBuilder hash_sb = new StringBuilder(obj.getClass().getSimpleName());

              if ( diff != null ) {
                // remove ids, timestamps and userfeedback
                diff.remove("id");
                diff.remove("created");
                diff.remove("lastModified");
                diff.remove("userFeedback");
                
                // convert array properties to list to get consistent hash
                // and create hash
                Iterator it = diff.entrySet().iterator();

                while( it.hasNext() ) {
                  Map.Entry next = (Map.Entry) it.next();
                  Object nextValue = next.getValue();
                  if ( nextValue instanceof Object[] ) {
                    next.setValue(Arrays.asList((Object[]) nextValue));
                  }
                  hash_sb.append(":" + String.valueOf(next.hashCode()));
                }
              }

              String key = diff == null || diff.size() == 0 ? ((ApprovableAware) obj).getStringId() : hash_sb.toString();
              return key;
            `
          })
        );
      }
    }
  ]
});
