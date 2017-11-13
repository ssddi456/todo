define([

], function(

) {
    var ret = {};

    function modal(id) {

        var $el = $(id);
        var source = $el.get(0)
        if( source ){
            source = source.outerHTML;
        }
        var $body = $el.find('.modal-body');
        var $edits = $body.find('input,textarea');

        function get_data() {
            var ret = {};
            $edits.each(function() {
                var $self = $(this);
                ret[$self.attr('name')] = $self.val();
            });
            return ret;
        }

        function set_data(optn) {
            $edits.each(function() {
                var $self = $(this);
                if ($self.attr('name') in optn) {
                    $self.val(optn[$self.attr('name')] || '');
                }
            });
        }

        var last_callback;
        var last_optns;

        function close() {
            $el.stop().fadeOut();
            last_callback = null;
            // for vue redraw
            if (last_optns.vm && last_optns.vm.$destroy) {
                last_optns.vm.$destroy(false);

                var $nel = $(source)
                $el.replaceWith($nel);

                $el = $nel;
                $body = $el.find('.modal-body');
                $edits = $body.find('input,textarea');

                $el.on('click', '[data-dismiss="modal"]', close);
                $el.on('click', '[data-label="confirm"]', confirm);
            }

            last_optns = null;
        }

        function confirm() {
            var data = get_data();
            var k;

            if (last_optns.data) {
                for (k in data) {
                    if (data.hasOwnProperty(k)) {
                        last_optns.data[k] = data[k];
                    }
                }
            }

            last_callback && last_callback(null, data);

            close();
        }

        function show(optn, callback) {
            if (optn.data) {
                set_data(optn.data);
            }

            last_callback = callback;
            last_optns = optn;

            $el.stop().fadeIn();
        }

        $el.on('click', '[data-dismiss="modal"]', close);
        $el.on('click', '[data-label="confirm"]', confirm);

        return show;
    };

    ret.modal = modal;

    ret.task_edit = modal('#task_edit');
    ret.task_progress_edit = modal('#task_progress_edit');
    ret.calender_event_edit = modal('#calender_event_edit');

    return ret;
});