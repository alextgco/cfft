var roleAccess_init =  function(id){
	var environment = MB.Content.find(id);
	var role_id = environment.role_id;
	var sid = MB.User.sid;
	var container = $('#roleAccessContainer');
	var objectToRender;
	var serverModel;
	var changedArray = [];
	$('#saveAccess:not(".disabled")').on('click', function(){
		accessModule.saveChanges();
	});
	var accessBlocksObject = {
		items: [
			// {
			// 	name: 'kill',
			// 	nameRu: 'Удалить',
			// 	inVisibleUser: 'hiddenImp',
			// 	items:{
			// 		data: ['action_scheme_item'],
			// 		methods: [],
			// 		operations: [],
			// 		menus: []
			// 	}
			// },
			{
				name: 'closeAccess',
				nameRu: 'Закрыть доступ',
				inVisibleUser: 'hiddenImp',
				items:{
					data: [ 
						'profile_filter_type',
						'profile',
						'profile_column',
						'profile_type_of_editor',
						'profile_key_type',
						'all_get_object',
						'main_menu_type',
						'main_menu',
						'sys_parameter',
						'all_object',
						'all_view',
						'basis_performance',
						'basis_operation_log',
						'basis_operation_status',
						'infobox_position',
						'color',
						'chair_skin_color'
					],
					methods: [
						{
							name: 'profile_column',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'basis_performance',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'profile',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'report_parameters',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'order_status',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'metro_zone',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'main_menu',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'sys_parameter',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						}					
					],
					operations: [
						'basis_import_perfomances',
						'basis_clear_unused',
						'basis_create_hall_scheme',
						'basis_create_action',
						'basis_import_places'
					],
					menus: [
						'parent_basis',
						'menu_basis_perfomance',
						'menu_basis_operation_log'
					]
				}
			},
			{
				name: 'casher_full',
				nameRu: 'Продажа билетов',
				inVisibleUser: '',
				items:{
					data: [
                        'user_active_lov',
                        'order_report_lov',
                        'sales_by_period',
                        'action_report_lov',
                        'action_report2_lov',
                        'summary_report',
                        'delivery_note_no_barcodes',
                        'action_scheme_ticket_zone',
                        'casher_report_cashdesk',
                        'report_return_delivery_note',
                        'cash_desk_for_reports_lov',
                        'user_for_reports_lov',
                        'cash_desk',
                        'ticket_pack_series_lov',
                        'ticket_defect_type',
                        'ticket_defective',
                        'action_scheme_for_clientscreen',
                        'print_queue',
						'order_status',
						'payment_type',
						'order_history_log',
						'payment_card_type',
						'action_free_places',
						'action_active',
						'ticket_pack_type',
						'order_ticket',
						'order_ticket_realization',
						//'order_ticket2',
						'afisha',
						'order',
						'order_realization',
						'order_overview',
						//'order_overview2',
						'order_ticket_action_lov',
						'action_scheme_hist_log',
						'delivery_status',
						'selected_place_info',
						'action_scheme',
						'crm_user',
						'ticket_pack_for_user2',
						'printer_with_ticket_pack',
						'action_range_list',
						'action_range',
						'action_scheme_object',
						'user_blocked_places',
                        'action_for_clientscreen'
					],
					methods: [
                        {
                            name: 'cash_desk',
                            NEW: 'TRUE',
                            MODIFY: 'TRUE',
                            REMOVE: 'TRUE'
                        },
                        {
                            name: 'ticket_defect_type',
                            NEW: 'TRUE',
                            MODIFY: 'TRUE',
                            REMOVE: 'TRUE'
                        },
                        {
                            name: 'ticket',
                            NEW: 'FALSE',
                            MODIFY: 'TRUE',
                            REMOVE: 'FALSE'
                        },
                        {
							name: 'order',
							NEW: 'FALSE',
							MODIFY: 'TRUE',
							REMOVE: 'FALSE'
						},
						{
							name: 'crm_user',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						}
					],
					operations: [
                        'to_reserve_order',
                        'to_reserve_ticket',
                        'remove_admin_place_reserv',
                        'create_admin_place_reserv',
                        'set_reserved_date_to_ticket',
                        'set_current_sca_number',
                        'defect_blank_by_id',
                        'on_realization_order',
                        'defect_blank_by_number',
                        'add_defective_ticket',
                        'print_ticket_cancel',
                        'print_ticket_response',
						'block_all_places',
						'to_pay_ticket',
						'on_realization_print_order',
						'close_realization_order',
						'cancel_order',
						'print_ticket',
						'create_reserv_order_without_places',
						'unblock_place_list',
						'to_pay_order',
						'create_reserv_order',
						'on_realization_ticket',
						'set_order_payment_type',
						'block_place_list',
						'return_ticket',
						'unblock_place_price_group',
						'on_realization_print_ticket',
						'cancel_ticket',
						'clear_blocked_place',
						'defect_ticket',
						'create_to_pay_order_without_places',
						'create_to_pay_order',
						'return_order',
						'block_by_cashier',
						'add_tickets_to_order',
						'close_realization_ticket',
						'print_order',
						'defect_blank',
						'print_ticket_by_server',
						'print_order_by_server',
						'send_delivery_note_to_email',
						'print_ticket_response',
                        'resend_tickets_for_customer'
					],
					menus: [
                        'menu_sales_by_period',
                        'menu_summary_report',
                        'menu_delivery_note_nobarcodes',
                        'menu_casher_report_cashdesk',
                        'menu_action_sales',
                        'menu_ticket_defect_type',
                        'menu_ticket_defective',
                        'menu_printer_settings',
						'parent_cashier',
						'menu_afisha',
						'menu_active_action',
						'menu_order',
						'menu_order_ticket'
					]
				}
			},
			{
				name: 'casher_subscription',
				nameRu: 'Продажа абонементов',
				inVisibleUser: '',
				items:{
					data: [
                        'cash_desk_for_reports_lov',
                        'user_for_reports_lov',
                        'cash_desk',
                        'ticket_pack_series_lov',
                        'ticket_defect_type',
                        'ticket_defective',
                        'action_scheme_for_clientscreen',
						'subscription_action_scheme',
						'active_subscription',
						'action_for_subscription',
						'action_scheme_object'
					],
					methods: [
                        {
                            name: 'cash_desk',
                            NEW: 'TRUE',
                            MODIFY: 'TRUE',
                            REMOVE: 'TRUE'
                        },
                        {
                            name: 'ticket_defect_type',
                            NEW: 'TRUE',
                            MODIFY: 'TRUE',
                            REMOVE: 'TRUE'
                        },
                        {
                            name: 'ticket',
                            NEW: 'FALSE',
                            MODIFY: 'TRUE',
                            REMOVE: 'FALSE'
                        }
                    ],
					operations: ['set_reserved_date_to_ticket','defect_blank_by_id','add_defective_ticket', 'defect_blank_by_number'],
					menus: [
                        'menu_action_sales',
                        'menu_ticket_defect_type',
                        'menu_ticket_defective',
                        'menu_printer_settings',
						'parent_cashier',
						'menu_afisha',
						'menu_active_action',
						'menu_active_subscription',
						'menu_order',
						'menu_order_ticket'
					]
				}
			},
			{
				name: 'base_access',
				nameRu: 'Базовый набор доступов',
				inVisibleUser: '',
				items:{
					data: [
                        'user_printer',
						'user_profile',
						'metro_station_sort_order_lov',
						'working_place',
						'printer_type',
						'user_info',
						'metro_zone',
						'select2_for_query',
						'metro_zone_lov',
						'action_active_hall_lov',
						'year_list',
						'metro_station',
						'sysdate',
						'action_status',
						'order_history_type',
						'menu_for_user',
						'action_scheme_object_point',
						'report_parameters',
						'chair_skin',
						'status',
						'metro_line',
						'customer_type',
						'ticket_type',
						'metro_line_lov',
						'user_type',
						'ticket_pack_user_info',
						'true_false',
						'ticket_pack_for_user',
						'ticket_print_status',
						'metro_station_lov',
						'main_search',
						'order_created_by',
						'ticket_operation',
                        'cash_desk'
					],
					methods: [
                        {
                            name: 'user_printer',
                            NEW: 'TRUE',
                            MODIFY: 'TRUE',
                            REMOVE: 'TRUE'
                        }
                    ],
					operations: [
                        'set_cash_desk',
                        'check_user_access_to_opeartion',
                        'clear_user_printer'
                    ],
					menus: []
				}
			},
			{
				name: 'users_and_roles_editing',
				nameRu: 'Редактирование пользователей и ролей',
				inVisibleUser: '',
				items:{
					data: [
						'users_for_user_role',
						'user_role',
						'role_access_operation',
						'user',
						'user_internal',
						'role_access_type',
						'role_access_menu',
						'role_access_get_object',
						'role_access_object',
						'role',
						'role_section'
					],
					methods: [
						{
							name: 'user_role',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'role_access_operation',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'role',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'user',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'role_access_get_object',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'role_access_menu',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'role_access_object',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'role_section',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						}
					],
					operations: [],
					menus: [
						'parent_setting',
						'menu_user',
						'menu_role',
						'menu_role_section'
					]
				}
			},
			{
				name: 'reports_full',
				nameRu: 'Все отчеты',
				inVisible_user: '',
				items:{
					data: [
                        'user_active_lov',
                        'report_sales_by_frame', //sales_by_frame
                        'sale_frame_report_lov',
                        'order_report_lov',//
                        'action_report_lov',
                        'action_report2_lov',
                        'report_return_delivery_note',
                        'report_incoming_cashdesk_order',
                        'cash_desk_for_reports_lov',
                        'user_for_reports_lov',
                        'report_journal_of_defects',
						'report_ticket_registry',
						'report_sale_of_tickets_for_action',
						'report_casher_report', // casher_report2
						'report_from_report_archive',
						'report_raportichka_grand',
						'report_casher_report_k_17',
						'report_archive',
						'report_casher_report',
						'report_delnote_ticket_pack',
						'report_raportichka',
						'report_bso_blanks',
						'report_register_transfer_of_roots',
						'report_action_sales_by_agents',
						'report_delivery_note',
						'report_journal_of_operations_summary',
						'report_action_all_places',
						'report_casher_journal_of_operations2',
						'report_return_note',
						'report_register_transfer_of_roots2',
						'report_casher_journal_of_operations',
						'report_casher_report_k172',
						'report_inclusion_order',
						'report_action_sales',
						'report_sale_of_tickets_for_action2',
						'report_web_tickets_for_action',
						'report_delivery_note_order'
					],
					methods: [],
					operations: [],
					menus: [
                        'menu_sales_by_frame',
                        'menu_incoming_cashdesk_order',
                        'menu_journal_of_defects',
                        'menu_bso_transfer_list',
						'parent_report',
						'menu_report_archive',
						'menu_casher_report2',
						'menu_casher_report_k172',
						'menu_journal_of_operations2',
						'menu_reg_root_report2',
						'menu_sale_of_tickets_for_action2',
						'menu_ticket_for_action',
						'menu_delivery_note2',
						'menu_return_note2',
						'menu_action_sales_by_agents',
						'menu_raportichka',
						'menu_bso_blanks',
						'menu_action_price_zones',
						'menu_inclusion_order',
						'menu_delivery_note_order',
						'menu_action_free_places',
						'menu_action_all_places',
						'menu_ticket_registry',
						'menu_delnote_ticket_pack',
						'menu_raportichka_grand',
						'menu_journal_of_operations_summary',
                        'menu_action_sales',
                        'menu_incoming_cashdesk_order',
                        'menu_return_delivery_note',
                        'menu_journal_of_defects'
					]
				}
			},
			{
				name: 'admin',
				nameRu: 'Администратор',
				inVisibleUser: '',
				items:{
					data: [
                        'user_active_lov',
                        'report_sales_by_frame',
                        'sale_frame_report_lov',
                        'order_report_lov',
                        'sales_by_period',
                        'action_report_lov',
                        'action_report2_lov',
                        'summary_report',
                        'delivery_note_no_barcodes',
                        'action_scheme_ticket_zone',
                        'casher_report_cashdesk',
                        'report_return_delivery_note',
                        'report_incoming_cashdesk_order',
                        'cash_desk_for_reports_lov',
                        'user_for_reports_lov',
                        'cash_desk',
                        'ticket_pack_series_lov',
                        'ticket_defect_type',
                        'ticket_defective',
                        'ticket',
                        'report_journal_of_defects',
                        'action_scheme_for_basket',
                        'action_scheme_for_clientscreen',
                        'action_scheme',
                        'action_scheme_for_editor',
                        'report_delnote_ticket_pack',
                        'report_journal_of_defects',
						'price_zone_pricing',
						'hall_scheme_fund_group',
						'order_agent',
						'hall_scheme_object_point',
						'order_ticket_for_action_email',
						'show_ticket_supplier',
						'show_active',
						'sale_site',
						'order_ticket_for_email',
						'action_scheme_layer',
						'fund_group_agent_access',
						'hall_scheme_for_action',
						'hall_scheme_area_group',
						'hall',
                        'ticket_pack_hist',
						'show_genre',
						'ticket_supplier',
						'ticket_supplier_lov',
						'age_category',
						'fund_availability_status',
						'subscription_price',
						'user_for_agent_user',
						'show_part',
						'hall_scheme_object_line',
						'action_scheme_pricing_item',
						'agent',
						'action',
						'show_type',
						'price_zone_pricing_item',
						'hall_scheme_pricezone_item',
						'user_active',
						'hall_scheme_fundzone',
						'hall_scheme_item',
						'hall_scheme_fundzone_item',
						'action_scheme_fund_group',
						'company',
						'subscription_item',
						'hall_scheme_layer',
						'action_scheme_object_point',
						'hall_scheme_price_group',
						'subscription',
						'hall_scheme',
						'organizer_lov',
						'hall_lov',
						'hall_scheme_pricezone',
						'hall_scheme_object',
						'external_customer_users',
						'hall_addresses',
						'hall_scheme_file_list',
						'agent_for_fund_group',
						'hall_scheme_object_type',
						'action_price_zones',
						'action_scheme_area_group',
						'action_file_list',
						'fund_group',
						'ticket_pack',
						'users_for_fund_group',
						'price_group_for_action_scheme',
						'action_scheme_place_color',
						'agent_active_lov',
						'show_type_lov',
						'show_status',
						'show',
						'agent_class',
						'fund_group_user_access',
						'printer',
						'agent_user',
						'agent_class_lov',
						'action_scheme_price_group',
						'user_external',
						'agent_user_lov',
						'action_access',
						'fund_group_for_action_scheme',
						'action_scheme_object_line',
						'action_scheme_pricing',
						'organizer',
						'price_group',
						'action_part',
                        'cashless_payment',
                        'action_for_clientscreen'
					],
					methods: [
                        {
                            name: 'cash_desk',
                            NEW: 'TRUE',
                            MODIFY: 'TRUE',
                            REMOVE: 'TRUE'
                        },
                        {
                            name: 'ticket_defect_type',
                            NEW: 'TRUE',
                            MODIFY: 'TRUE',
                            REMOVE: 'TRUE'
                        },
                        {
                            name: 'ticket',
                            NEW: 'TRUE',
                            MODIFY: 'TRUE',
                            REMOVE: 'TRUE'
                        },
                        {
                            name: 'action_scheme',
                            NEW: 'TRUE',
                            MODIFY: 'TRUE',
                            REMOVE: 'TRUE'
                        },
                        {
                            name: 'action_file_list',
                            NEW: 'TRUE',
                            MODIFY: 'TRUE',
                            REMOVE: 'TRUE'
                        },
                        {
                            name: 'action_scheme_area_group',
                            NEW: 'TRUE',
                            MODIFY: 'TRUE',
                            REMOVE: 'TRUE'
                        },
                        {
                            name: 'action_scheme_object',
                            NEW: 'TRUE',
                            MODIFY: 'TRUE',
                            REMOVE: 'TRUE'
                        },
                        {
                            name: 'action_scheme_layer',
                            NEW: 'TRUE',
                            MODIFY: 'TRUE',
                            REMOVE: 'TRUE'
                        },
                        //----------------
						{
							name: 'action_scheme_pricing',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'hall_scheme_pricezone',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'ticket_pack',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
                        {
                            name: 'ticket_pack_hist',
                            NEW: 'TRUE',
                            MODIFY: 'TRUE',
                            REMOVE: 'TRUE'
                        },
						{
							name: 'hall_scheme_object',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'chair_skin',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'hall_scheme_object_point',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'agent_user',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'price_zone_pricing',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'payment_card_type',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'show_ticket_supplier',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'printer',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'working_place',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'sale_site',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'printer_with_ticket_pack',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'fund_group_agent_access',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'delivery_man',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'color',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'hall_scheme_area_group',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'agent_class',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'action_access',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'hall',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'ticket_pack_type',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'subscription_price',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'show_genre',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'chair_skin_color',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'ticket_supplier',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'show_part',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'age_category',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'agent',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'action',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'show_type',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'price_zone_pricing_item',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'hall_scheme_pricezone_item',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'hall_scheme_fundzone',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'hall_scheme_layer',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'hall_scheme_item',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'hall_scheme_fundzone_item',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'company',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'fund_group_user_access',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'subscription',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'subscription_item',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'hall_scheme',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'hall_scheme_object_line',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'price_group',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'action_scheme_pricing_item',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'order_ticket',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'metro_station',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'organizer',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'show',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'hall_addresses',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'fund_group',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'action_scheme_place_color',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'hall_scheme_file_list',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'metro_line',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'action_file_list',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'action_scheme_area_group',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						},
						{
							name: 'action_part',
							NEW: 'TRUE',
							MODIFY: 'TRUE',
							REMOVE: 'TRUE'
						}
					],
					operations: [
                        'to_reserve_order',
                        'to_reserve_ticket',
                        'create_tickets_without_places',
                        'remove_admin_place_reserv',
                        'create_admin_place_reserv',
                        'set_reserved_date_to_ticket',
                        'set_current_sca_number',
                        'defect_blank_by_id',
                        'check_user_access_to_opeartion',
                        'on_realization_order',
                        'defect_blank_by_number',
                        'add_defective_ticket',
                        'sleep',
                        'print_queue_cancel_by_user',
						'change_order_discount',
                        'add_batch_ticket_pack',
                        'send_excel_to_email',
						'block_place_price_group',
						'change_hall_scheme_item_area_group_by_list',
						'set_default_action_pricing_id',
						'remove_all_scheme_items',
						'new_hall_scheme_item',
						'modify_hall_scheme_item',
						'synchronize_hall_scheme_item',
						'change_hall_scheme_item_fund_group',
						'copy_hall_scheme_fund_zone',
						'copy_hall_scheme_price_zone',
						'fill_price_zone_by_price_group',
						'change_action_scheme_price_group_by_list',
						'change_hall_scheme_item_price_group_by_list',
						'set_fund_zone_default',
						'copy_price_zone_pricing',
						'change_action_scheme_fund_group',
						'create_action_scheme',
						'change_action_scheme_price_group',
						'fill_action_scheme_by_price_group',
						'copy_hall_scheme',
						'synchronize',
						'delete_hall_scheme_item',
						'fill_fund_zone_by_fund_group',
						'generate_repertuar',
						'copy_action_pricing',
						'create_action_scheme_without_places',
						'set_price_zone_default',
						'set_price_zone_pricing_default',
						'generate_hall_scheme_items',
						'change_hall_scheme_item_fund_group_by_list',
						'delete_action_scheme',
						'change_action_scheme_fund_group_by_list',
						'generate_action_scheme_items',
						'new_action_scheme_item',
						'copy_action_scheme',
						'delete_action_scheme_item',
						'modify_action_scheme_item',
                        'modify_action_scheme',
						'change_action_scheme_item_area_group_by_list',
						'copy_role',
                        'fill_action_scheme_by_fund_group'
					],
					menus: [
                        'menu_sales_by_frame',
                        'menu_sales_by_period',
                        'menu_summary_report',
                        'menu_delivery_note_nobarcodes',
                        'menu_casher_report_cashdesk',
                        'menu_incoming_cashdesk_order',
                        'menu_cash_desk',
                        'menu_action_sales',
                        'menu_ticket_defect_type',
                        'menu_ticket_defective',
                        'menu_journal_of_defects',
                        'menu_printer_settings',
                        'menu_bso_transfer_list',
						'parent_cashier',
						'menu_afisha',
						'menu_active_action',
						'menu_order',
						'menu_order_ticket',
						'parent_admin',
						'menu_show',
						'menu_action',
						'menu_subscription',
						'menu_crm_user',
						'menu_generate_repertuar',
						'menu_ticket_pack',
						'menu_basic_data',
						'menu_fund_group',
						'menu_price_group',
						'menu_hall_addresses',
						'menu_area_group',
						'menu_hall',
						'menu_age_category',
						'menu_action_scheme_place_color',
						'menu_ticket_pack_type',
						'menu_hall_scheme',
						'menu_agent',
						'menu_show_ogranizer',
						'menu_show_ticket_supplier',
						'menu_show_type',
						'menu_show_genre',
						'menu_agent_class',
						'menu_payment_card_type',
						'parent_reception',
						'menu_afisha',
						'menu_active_action',
						'menu_active_subscription',
						'menu_crm_user',
						'menu_order',
						'menu_order_ticket',
						'parent_call_center',
						'menu_afisha',
						'menu_active_action',
						'menu_order',
						'menu_order_ticket',
						'menu_crm_user',
						'parent_skd',
						'menu_current_actions',
						'menu_active_action',
						'menu_order_ticket',
						'menu_order',
						'parent_crm',
						'menu_crm_user',
						'parent_report',
						'menu_report_archive',
						'menu_casher_report2',
						'menu_casher_report_k172',
						'menu_journal_of_operations2',
						'menu_reg_root_report2',
						'menu_sale_of_tickets_for_action2',
						'menu_ticket_for_action',
						'menu_delivery_note2',
						'menu_return_note2',
						'menu_action_sales_by_agents',
						'menu_raportichka',
						'menu_bso_blanks',
						'menu_action_price_zones',
						'menu_inclusion_order',
						'menu_delivery_note_order',
						'menu_action_free_places',
						'menu_action_all_places',
						'menu_ticket_registry',
						'menu_delnote_ticket_pack',
						'menu_raportichka_grand',
						'menu_journal_of_operations_summary',
						'parent_setting',
						'menu_user',
						'menu_role',
						'menu_working_place',
						'menu_edit_menu',
						'menu_printer',
						'menu_sys_parameter',
						'menu_object_profile',
						'menu_company',
						'menu_sale_site',
						'menu_role_section',
						'parent_basis',
						'menu_basis_perfomance',
						'menu_basis_operation_log',
                        'menu_cash_desk',
                        'menu_ticket_defect_type',
                        'menu_cashless_payment'

					]
				}
			},
			{
				name: 'skd',
				nameRu: 'СКД',
				inVisibleUser: '',
				items:{
					data: [
						'action_active_today',
						'action_scheme_enter_in_hall',
						'action_scheme_object'
					],
					methods: [],
					operations: [
                        'clear_all_enter_in_hall_status',
                        'clear_enter_in_hall_status'
                    ],
					menus: []
				}
			}
		]
	};
	var accessModule = {
		startLoader: function(){
			var loaderHtml = '<div id="loaderWrap"><div class="loader_header">Подождите, идет процесс сохранения...</div><div class="loader_content"><div class="loader_bar"><div id="loader_progress"><div id="innerPrecent"></div></div></div></div></div>';
			container.find('#loader_wrapper').html(loaderHtml);
			container.find('.access_dd_toggler.opened').click();
			$('#saveAccess').addClass('disabled');
			container.find('#accessFader').fadeIn(100);
		},
		updateLoader: function(now, full){
			var progress = 0;
			if(full && +full > 0 && now && now>0){
				progress = (+now/+full*100).toFixed(2);
			}
			var progressWrapElem = container.find('#loaderWrap .loader_bar');
			var progressElem = container.find('#loaderWrap #loader_progress');
			var barWidth = +progressWrapElem.width();

			progressElem.animate({
				width: +barWidth/100*+progress+'px'
			},50);
			progressElem.find('#innerPrecent').html(progress+' %');
		},
		stopLoader: function(){
			

			container.find('#loaderWrap #loader_progress').width(0);
			$('#loaderWrap').fadeOut(250).hide(250, function(){
				$('#loaderWrap').remove();
				container.find('#accessFader').fadeOut(100);	

			});
		},
		getDataFormServer: function(callback){
			var resObj ={};
			var ready = 0;
			MB.Core.sendQuery({
				command:'get',
				object:'role_access_get_object',
				where: 'ROLE_ID ='+ role_id,
				order_by:'',
				client_object:'tbl_role_access_get_object',
				sid:sid,
				page_no:1,
				rows_max_num:1000
			}, function(ress){
				resObj.data_fromServer = ress;
				ready ++;
				runCallback();
			});

			MB.Core.sendQuery({
				command:'get',
				object:'role_access_operation',
				where: 'ROLE_ID ='+ role_id,
				order_by:'',
				client_object:'tbl_role_access_operation',
				sid:sid,
				page_no:1,
				rows_max_num:1000
			}, function(ress){
				resObj.operations_fromServer = ress;
				ready ++;
				runCallback();
			});

			MB.Core.sendQuery({
				command:'get',
				object:'role_access_menu',
				where: 'ROLE_ID ='+ role_id,
				order_by:'',
				client_object:'tbl_role_access_menu',
				sid:sid,
				page_no:1,
				rows_max_num:1000
			}, function(ress){
				resObj.menus_fromServer = ress;
				ready ++;
				runCallback();
			});

			MB.Core.sendQuery({
				command:'get',
				object:'role_access_object',
				where: 'ROLE_ID ='+ role_id,
				order_by:'',
				client_object:'tbl_role_access_object',
				sid:sid,
				page_no:1,
				rows_max_num:1000
			}, function(ress){
				resObj.methods_fromServer = ress;
				ready ++;
				runCallback();
			});	

			function runCallback(){
				if(ready == 4){
					if(typeof callback == 'function'){
						console.log('FROM SERVER', resObj);
						callback(resObj);
					}
				}
			}
		},
		getFullInfoByKeyword: function(serverData, type, keyword){
			var result = {};
			
			switch(type){
				case 'data':
					var dataInfo = {};
					for(var i in serverData.data_fromServer.DATA){
						var item = serverData.data_fromServer.DATA[i];
						if(item[serverData.data_fromServer.NAMES.indexOf('GET_OBJECT')] == keyword){
							dataInfo = {
								id: 		item[serverData.data_fromServer.NAMES.indexOf('ROLE_ACCESS_GET_OBJECT_ID')],
								keywordRu: 	item[serverData.data_fromServer.NAMES.indexOf('DESCRIPTION')],
								value: 		item[serverData.data_fromServer.NAMES.indexOf('EXECUTE_RU')]
							}
						}
					}
					result = {
						id: dataInfo.id,
						keyword: keyword,
						keywordRu: dataInfo.keywordRu,
						value: dataInfo.value,
						checked: (dataInfo.value == 'TRUE')? 'checked="checked"': ''
					}
					break;
				case 'method':
					var dataInfo = {};
					for(var i in serverData.methods_fromServer.DATA){
						var item = serverData.methods_fromServer.DATA[i];
						if(item[serverData.methods_fromServer.NAMES.indexOf('OBJECT')] == keyword){
							dataInfo = {
								id: 		item[serverData.methods_fromServer.NAMES.indexOf('ROLE_ACCESS_OBJECT_ID')],
								keyword: 	keyword,
								keywordRu: 	item[serverData.methods_fromServer.NAMES.indexOf('DESCRIPTION')],
								NEW: 		item[serverData.methods_fromServer.NAMES.indexOf('NEW_COMMAND')],
								MODIFY: 	item[serverData.methods_fromServer.NAMES.indexOf('MODIFY_COMMAND')],
								REMOVE: 	item[serverData.methods_fromServer.NAMES.indexOf('REMOVE_COMMAND')]
							}
						}
					}
					result = {
						id: 		dataInfo.id,
						keyword: 	keyword,
						keywordRu: 	dataInfo.keywordRu,
						NEW: 		dataInfo.NEW,
						MODIFY: 	dataInfo.MODIFY,
						REMOVE: 	dataInfo.REMOVE,
						new_checked: (dataInfo.NEW == '1')? 'checked="checked"': '',
						modify_checked: (dataInfo.MODIFY == '1')? 'checked="checked"': '',
						remove_checked: (dataInfo.REMOVE == '1')? 'checked="checked"': ''
					}
					
					break;
				case 'operation':
					var dataInfo = {};
					for(var i in serverData.operations_fromServer.DATA){
						var item = serverData.operations_fromServer.DATA[i];
						if(item[serverData.operations_fromServer.NAMES.indexOf('OPERATION')] == keyword){
							dataInfo = {
								id: 		item[serverData.operations_fromServer.NAMES.indexOf('ROLE_ACCESS_OPERATION_ID')],
								keywordRu: 	item[serverData.operations_fromServer.NAMES.indexOf('DESCRIPTION')],
								value: 		item[serverData.operations_fromServer.NAMES.indexOf('EXECUTE_RU')]
							}
						}
					}
					result = {
						id: dataInfo.id,
						keyword: keyword,
						keywordRu: dataInfo.keywordRu,
						value: dataInfo.value,
						checked: (dataInfo.value == 'TRUE')? 'checked="checked"': ''

					}
					break;
				case 'menu':
					var dataInfo = {};
                    //console.log(serverData.menus_fromServer.DATA);
					for(var i in serverData.menus_fromServer.DATA){
						var item = serverData.menus_fromServer.DATA[i];
						if(item[serverData.menus_fromServer.NAMES.indexOf('MENU_ITEM')] == keyword){
							dataInfo = {
								id: 		item[serverData.menus_fromServer.NAMES.indexOf('ROLE_ACCESS_MENU_ID')],
								keywordRu: 	item[serverData.menus_fromServer.NAMES.indexOf('NAME')],
								value: 		item[serverData.menus_fromServer.NAMES.indexOf('VISIBLE_RU')]
							}
						}
					}
					result = {
						id: dataInfo.id,
						keyword: keyword,
						keywordRu: dataInfo.keywordRu,
						value: dataInfo.value,
						checked: (dataInfo.value == 'TRUE')? 'checked="checked"': ''
					};
					break;
			}
			return result;
		},
		separateByBlocks: function(serverData, callback){
			objectToRender = [{
				items: []
			}];

            //console.log('bf separate', serverData);

			for(var i in accessBlocksObject.items){

				function getDataArrayByBlockName(){
					var res = [];
					for(var k in accessBlocksObject.items[i].items.data){
						res.push(accessModule.getFullInfoByKeyword(serverData, 'data', accessBlocksObject.items[i].items.data[k]));
					}
					return res;
				}
				function getMethodsArrayByBlockName(){
					var res = [];
					for(var k in accessBlocksObject.items[i].items.methods){
						res.push(accessModule.getFullInfoByKeyword(serverData, 'method', accessBlocksObject.items[i].items.methods[k].name));
					}
					return res;
				}
				function getOperationsArrayByBlockName(){
					var res = [];
					for(var k in accessBlocksObject.items[i].items.operations){
						res.push(accessModule.getFullInfoByKeyword(serverData, 'operation', accessBlocksObject.items[i].items.operations[k]));
					}
					return res;
				}
				function getMenuArrayByBlockName(){
					var res = [];
					for(var k in accessBlocksObject.items[i].items.menus){
						res.push(accessModule.getFullInfoByKeyword(serverData, 'menu', accessBlocksObject.items[i].items.menus[k]));
					}
					return res;
				}

				function isBlockEnabled(){
					for(var i in getDataArrayByBlockName()){
						var item = getDataArrayByBlockName()[i];
						if(item.value == 'TRUE'){
							return 'checked="checked"';
						}
					}
					for(var i in getMethodsArrayByBlockName()){
						var item = getMethodsArrayByBlockName()[i];
						if(item.NEW == 'TRUE' || item.NEW == 'MODIFY' || item.NEW == 'REMOVE'){
							return 'checked="checked"';
						}
					}
					for(var i in getOperationsArrayByBlockName()){
						var item = getOperationsArrayByBlockName()[i];
						if(item.value == 'TRUE'){
							return 'checked="checked"';
						}
					}
					for(var i in getMenuArrayByBlockName()){
						var item = getMenuArrayByBlockName()[i];
						if(item.value == 'TRUE'){
							return 'checked="checked"';
						}
					}
				}
				function isFullEnabled(){
					for(var i in getDataArrayByBlockName()){
						var item = getDataArrayByBlockName()[i];
						if(item.value == 'FALSE'){
							return false;
						}
					}
					for(var i in getMethodsArrayByBlockName()){
						var item = getMethodsArrayByBlockName()[i];
						if(item.NEW == 'FALSE' && item.NEW == 'FALSE' && item.NEW == 'FALSE'){
							return false;
						}
					}
					for(var i in getOperationsArrayByBlockName()){
						var item = getOperationsArrayByBlockName()[i];
						if(item.value == 'FALSE'){
							return false;
						}
					}
					for(var i in getMenuArrayByBlockName()){
						var item = getMenuArrayByBlockName()[i];
						if(item.value == 'FALSE'){
							return false;
						}
					}
				}

				var obj = {
					name: accessBlocksObject.items[i].name,
					nameRu: accessBlocksObject.items[i].nameRu,
					blockEnabled: isBlockEnabled(),
					isFullEnabled: (isFullEnabled() == false)? false: true,
					items:{
						data: 		getDataArrayByBlockName(),
						methods: 	getMethodsArrayByBlockName(),
						operations: getOperationsArrayByBlockName(),
						menu: 		getMenuArrayByBlockName()
					}
				};
				objectToRender[0].items.push(obj);
			}
			if(typeof callback == 'function'){
				callback(objectToRender);
			}
		},
		render: function(data, wrap, callback){
			var template = '<div id="accessWrapper"><div class="padder10"><div id="loader_wrapper"></div><div id="accessFader"></div>{{#items}}<div class="accessBlock ">'+
							'<div class="padder5">'+
								'<div class="accessTitle">'+
									'<div class="boxForInput"><input type="checkbox" class="enableAccesBlock" {{blockEnabled}}></div>'+
									'<div class="boxForTitle">{{nameRu}}{{inVisibleUser}} {{#isFullEnabled}}<span class="isFullEnabled">Все включено</span>{{/isFullEnabled}}</div></div>'+
									'<div class="access_dd_toggler"><i class="fa fa-arrow-down"></i></div>'+
								'</div>'+
							'<div class="access_DD">'+
								'<div class="padder5">'+
									'<div class="tabsParent sc_tabulatorParent">'+
									    '<div class="tabsTogglersRow sc_tabulatorToggleRow">'+
									        '<div class="tabToggle sc_tabulatorToggler opened" dataitem="menu">'+
									            '<span class="">Меню</span>'+
									        '</div>'+
									        '<div class="tabToggle sc_tabulatorToggler" dataitem="data">'+
									            '<span class="">Данные</span>'+
									        '</div>'+
									        '<div class="tabToggle sc_tabulatorToggler" dataitem="operation">'+
									            '<span class="">Операции</span>'+
									        '</div>'+
									        '<div class="tabToggle sc_tabulatorToggler" dataitem="method">'+
									            '<span class="">Методы</span>'+
									        '</div>'+
									    '</div>'+
								    	
									    '<div class="ddRow sc_tabulatorDDRow">'+
									        '<div class="tabulatorDDItem noMinHeight  sc_tabulatorDDItem opened" dataitem="menu">'+
									        	'<ul class="enchancedList menuList">'+
								           		'{{#items}}'+
									           		'{{#menu}}'+
								           				'<li>'+
								           					'<div class="boxForInput"><input type="checkbox" data-id="{{id}}" data-type="menu"  name="{{keyword}}" {{checked}} /></div><div class="keywordRu">{{keywordRu}}<div class="keyword">{{keyword}}</div></div>'+
								           				'</li>'+
									           		'{{/menu}}'+
								           		'{{/items}}'+
								           		'</ul>'+
									        '</div>'+

									        '<div class=" tabulatorDDItem noMinHeight  sc_tabulatorDDItem" dataitem="data">'+
									            '<ul class="enchancedList dataList">'+
									            '{{#items}}'+
									           		'{{#data}}'+
								           				'<li>'+
								           					'<div class="boxForInput"><input type="checkbox" data-id="{{id}}" data-type="data"  name="{{keyword}}" {{checked}} /></div><div class="keywordRu">{{keywordRu}}<div class="keyword">{{keyword}}</div></div>'+
								           				'</li>'+
									           		'{{/data}}'+
								           		'{{/items}}'+
								           		'</ul>'+
									        '</div>'+

									        '<div class=" tabulatorDDItem noMinHeight  sc_tabulatorDDItem" dataitem="operation">'+
									            '<ul class="enchancedList operationsList">'+
									            '{{#items}}'+
									           		'{{#operations}}'+
								           				'<li>'+
								           					'<div class="boxForInput"><input type="checkbox" data-id="{{id}}"  data-type="operation"  name="{{keyword}}" {{checked}} /></div><div class="keywordRu">{{keywordRu}}<div class="keyword">{{keyword}}</div></div>'+
								           				'</li>'+
									           		'{{/operations}}'+
								           		'{{/items}}'+
								           		'</ul>'+
									        '</div>'+

									        '<div class=" tabulatorDDItem noMinHeight  sc_tabulatorDDItem" dataitem="method">'+
									        	'<div class="padder10">'+
										            '<table class="enchancedList methodsList">'+
											            '<thead>'+
											            	'<tr>'+
											            		'<th class="fixW">NEW</th>'+
											            		'<th class="fixW">MODIFY</th>'+
											            		'<th class="fixW">REMOVE</th>'+
											            		'<th>&nbsp;</th>'+
											            		'<th>&nbsp;</th>'+
										            		'</tr>'+
									            		'</thead>'+
									            		'<tbody>'+
								            				'{{#items}}'+
												           		'{{#methods}}'+
											           				'<tr>'+
											           					'<td class="fixW"><input type="checkbox" data-id="{{id}}" data-chkType="NEW" data-type="method"  name="{{keyword}}" class="m-new oneOfThree" {{new_checked}} /></td>'+
											           					'<td class="fixW"><input type="checkbox" data-id="{{id}}" data-chkType="MODIFY" data-type="method"  name="{{keyword}}" class="m-modify oneOfThree" {{modify_checked}} /></td>'+
											           					'<td class="fixW"><input type="checkbox" data-id="{{id}}" data-chkType="REMOVE" data-type="method"  name="{{keyword}}" class="m-remove oneOfThree" {{remove_checked}} /></td>'+
											           					'<td><div class="keywordRu">{{keywordRu}}</div></td>'+
											           					'<td><div class="keyword">{{keyword}}</div></td>'+
											           				'</tr>'+
												           		'{{/methods}}'+											           		
											           		'{{/items}}'+
									           			'</tbody>'+
									           		'</table>'+
								           		'</div>'+
									        '</div>'+
									    '</div>'+
									'</div>'+
								'</div></div></div>{{/items}}</div></div>';
			wrap.html(Mustache.to_html(template, data[0]));			

			if(typeof callback == 'function'){
				callback();
			}
		},
		addItemToChangedArray: function(checkbox){
			var total = 0;
			if(changedArray.length == 0){
				changedArray.push(checkbox);
				return;
			}
			for(var i in changedArray){
				var item = changedArray[i];
				if(item.id == checkbox.id && item.type == checkbox.type){
					if(checkbox.type == 'method'){
						if(item.checkType == checkbox.checkType){
							item[item.checkType] = checkbox[checkbox.checkType];
							total++;
						}
					}else{
						item.state = checkbox.state;
						total++;
					}
				}
			}
			if(total == 0){
				changedArray.push(checkbox);
			}
		},
		processingCheckbox: function(checkbox, isMass, e){
			var incEvent = e;
			var otherChecks;

			if(checkbox.type != 'method'){
				otherChecks = container.find('.tabulatorDDItem[dataitem="'+checkbox.type+'"] input[type="checkbox"][data-id="'+checkbox.id+'"][data-type="'+checkbox.type+'"]');
				if(isMass){
					if(checkbox.state){
						otherChecks.attr('checked','checked');
					}else{
						otherChecks.removeAttr('checked');
					}
					otherChecks.uniform();
				}else{

					if(otherChecks.length > 1){					
						var titleA = [];
						var tabA = $(otherChecks[0]).parents('.tabulatorDDItem').attr('dataitem');
						var tabTitleA =  $(otherChecks[0]).parents('.accessBlock').find('.tabToggle[dataitem="'+tabA+'"] span').html();

						for(var i = 0; i<otherChecks.length; i++){
							if($.inArray($(otherChecks[i]).parents('.accessBlock').find('.boxForTitle').html(), titleA) == -1){
								titleA.push($(otherChecks[i]).parents('.accessBlock').find('.boxForTitle').html());
							}
						}

						var title = titleA.join(', '); 

						var onOffStr = (checkbox.state)? 'ВКЛ':'ВЫКЛ';
						var infoString = '<div>Внимание!<br /> В блоке(ах) "'+title+'", в разделе "'+tabTitleA+'"<br /> будет изменено поле "'+checkbox.name+'" в положение '+onOffStr+'.</div>';

						bootbox.dialog({
			                message: infoString,
			                title: 'Изменение доступа',
			                buttons: {
			                    success: {
			                        label: "Подтвердить",
			                        className: "blue",
			                        callback: function(){
										if(checkbox.state){
											otherChecks.attr('checked','checked');
										}else{
											otherChecks.removeAttr('checked');
										}
										otherChecks.uniform();
			                        }
			                    },
			                    error: {
			                        label: "Отмена",
			                        className: "red",
			                        callback: function(){
			                        	if(checkbox.state){
			                        		checkbox.elem.removeAttr('checked');
			                        	}else{
			                        		checkbox.elem.attr('checked','checked');	
			                        	}
										checkbox.elem.uniform();
			                        }
			                    }
			                }
			            });
					}else{
						if(checkbox.state){
							otherChecks.attr('checked','checked');
						}else{
							otherChecks.removeAttr('checked');
						}
						otherChecks.uniform();
					}
				}
				
				accessModule.addItemToChangedArray(checkbox);
			}else{				
				otherChecks = container.find('.tabulatorDDItem[dataitem="'+checkbox.type+'"] input[type="checkbox"][data-id="'+checkbox.id+'"][data-type="'+checkbox.type+'"][data-chkType="'+checkbox.checkType+'"]');				
				if(isMass){
					if(checkbox.state){
						otherChecks.attr('checked','checked');
					}else{
						otherChecks.removeAttr('checked');
					}
					otherChecks.uniform();
				}else{
					if(otherChecks.length > 1){
						var titleA = [];
						var tabA = $(otherChecks[0]).parents('.tabulatorDDItem').attr('dataitem');
						var tabTitleA =  $(otherChecks[0]).parents('.accessBlock').find('.tabToggle[dataitem="'+tabA+'"] span').html();

						for(var i = 0; i<otherChecks.length; i++){
							titleA.push($(otherChecks[i]).parents('.accessBlock').find('.boxForTitle').html());
						}

						var title = titleA.join(', '); 

						var onOffStr = (checkbox.state)? 'ВКЛ':'ВЫКЛ';
						var infoString = '<div>Внимание!<br /> В блоке(ах) "'+title+'", в разделе "'+tabTitleA+'"<br /> будет изменено поле "'+checkbox.name+' ('+checkbox.checkType+')" в положение '+onOffStr+'.</div>';

						bootbox.dialog({
			                message: infoString,
			                title: 'Изменение доступа',
			                buttons: {
			                    success: {
			                        label: "Подтвердить",
			                        className: "blue",
			                        callback: function(){
										if(checkbox.state){
											otherChecks.attr('checked','checked');
										}else{
											otherChecks.removeAttr('checked');
										}
										otherChecks.uniform();
			                        }
			                    },
			                    error: {
			                        label: "Отмена",
			                        className: "red",
			                        callback: function(){
			                        	if(checkbox.state){
			                        		checkbox.elem.removeAttr('checked');
			                        	}else{
			                        		checkbox.elem.attr('checked','checked');	
			                        	}
										checkbox.elem.uniform();
			                        }
			                    }
			                }
			            });
					}else{
						if(checkbox.state){
							otherChecks.attr('checked','checked');
						}else{
							otherChecks.removeAttr('checked');
						}
						otherChecks.uniform();
					}
				}
				accessModule.addItemToChangedArray(checkbox);
				//changedArray.push(checkbox);
			}		
		},
		setHandlers: function(callback){
			uiTabs();
			container.find('input[type="checkbox"]:not(".noUniform")').uniform();
			container.find('.access_DD').hide(0);

			container.find('input[type="checkbox"].enableAccesBlock').on('change', function(e){

				var aBlock = $(this).parents('.accessBlock');
				var innerCollection = aBlock.find('input[type="checkbox"]:not(".enableAccesBlock")');
				var state = $(this).attr('checked') == 'checked';
				if(state){
					for(var i=0; i<innerCollection.length; i++){
						var item = innerCollection.eq(i);
						item.attr('checked','checked');
					}	
				}else{
					for(var i=0; i<innerCollection.length; i++){
						var item = innerCollection.eq(i);
						item.removeAttr('checked');
					}
				}

				for(var k=0; k<innerCollection.length; k++){
					var item = innerCollection.eq(k);
					var checkbox = {
						state: item.attr('checked') == 'checked',
						id: item.data('id'),
						type: item.data('type'),
						checkType:item.attr('data-chkType'),
						name: item.attr('name'),
						elem: item
					}
					accessModule.processingCheckbox(checkbox, true, e);
				}

				innerCollection.uniform();				
			});

			container.find('input[type="checkbox"]:not(".enableAccesBlock")').on('change', function(e, args){
				var checkbox = {
					state: $(this).attr('checked') == 'checked',
					id: $(this).data('id'),
					type: $(this).data('type'),
					checkType: $(this).attr('data-chkType'),
					name: $(this).attr('name'),
					elem: $(this)
				}
				accessModule.processingCheckbox(checkbox, false, e);	
			});

			for(var i = 0; i< container.find('.accessBlock').length; i++){
				var aBlock = container.find('.accessBlock').eq(i);
				var toggler = aBlock.find('.access_dd_toggler');
			
				toggler.on('click', function(){
					var thisDD = $(this).parents('.accessBlock').find('.access_DD');
					if($(this).hasClass('opened')){
						thisDD.hide(250);
						$(this).find('i').removeClass('fa-arrow-up').addClass('fa-arrow-down');
						$(this).removeClass('opened');
					}else{
						thisDD.show(250);
						$(this).find('i').removeClass('fa-arrow-down').addClass('fa-arrow-up');
						$(this).addClass('opened');
					}
				});
			}

			$('#searchAccess').on('input', function(){
				accessModule.hightlightSearchResults($(this).val());
			});

			if(typeof callback == 'function'){
				callback();
			}
		},
		reload: function(callback){
			//console.log(new Date());
			accessModule.getDataFormServer(function(serverData){
				serverModel = serverData;
				accessModule.separateByBlocks(serverData, function(separated){
					accessModule.render(separated, container, function(){
						accessModule.setHandlers(function(){

						});
					});
				});
			});
		},
		getOtherCheckById: function(id, type, value){
			var res = {};
			var NEW = (container.find('input[type="checkbox"]:not(".enableAccesBlock")[data-id="'+id+'"][data-chktype="NEW"]').eq(0).attr('checked') == 'checked')? 'TRUE': 'FALSE';
			var MODIFY = (container.find('input[type="checkbox"]:not(".enableAccesBlock")[data-id="'+id+'"][data-chktype="MODIFY"]').eq(0).attr('checked') == 'checked')? 'TRUE': 'FALSE';
			var REMOVE = (container.find('input[type="checkbox"]:not(".enableAccesBlock")[data-id="'+id+'"][data-chktype="REMOVE"]').eq(0).attr('checked') == 'checked')? 'TRUE': 'FALSE';

			res = {
				NEW: NEW,
				MODIFY: MODIFY,
				REMOVE:REMOVE
			}

			return res;
		},
		getObjversionById: function(type, id){
			switch(type){
				case 'data':
					for(var i in serverModel.data_fromServer.DATA){
						var item = serverModel.data_fromServer.DATA[i];
						if(item[serverModel.data_fromServer.NAMES.indexOf('ROLE_ACCESS_GET_OBJECT_ID')] == id){
							return item[serverModel.data_fromServer.NAMES.indexOf('OBJVERSION')];
						}
					}
					break;
				case 'operation':
					for(var i in serverModel.operations_fromServer.DATA){
						var item = serverModel.operations_fromServer.DATA[i];
						if(item[serverModel.operations_fromServer.NAMES.indexOf('ROLE_ACCESS_OPERATION_ID')] == id){
							return item[serverModel.operations_fromServer.NAMES.indexOf('OBJVERSION')];
						}
					}
					break;
				case 'menu':
					for(var i in serverModel.menus_fromServer.DATA){
						var item = serverModel.menus_fromServer.DATA[i];
						if(item[serverModel.menus_fromServer.NAMES.indexOf('ROLE_ACCESS_MENU_ID')] == id){
							return item[serverModel.menus_fromServer.NAMES.indexOf('OBJVERSION')];
						}
					}
					break;
				case 'method':
					for(var i in serverModel.methods_fromServer.DATA){
						var item = serverModel.methods_fromServer.DATA[i];
						if(item[serverModel.methods_fromServer.NAMES.indexOf('ROLE_ACCESS_OBJECT_ID')] == id){
							return item[serverModel.methods_fromServer.NAMES.indexOf('OBJVERSION')];
						}
					}
					break;
			}					
		},
		saveChanges: function(){
			//console.log(changedArray);
			var inter = 0;
			accessModule.startLoader();
			function sendRequest(inter){
				var item = changedArray[inter];
				//console.log(inter, changedArray.length);

				accessModule.updateLoader(inter, changedArray.length);
				if(inter == changedArray.length){
					$('#saveAccess').removeClass('disabled');
					accessModule.reload(function(){
						changedArray = [];
						inter = 0;
						accessModule.stopLoader();
					});
					return;
				}
				switch(item.type){
					case 'data':
						var o = {
							command:'modify',
							object:'role_access_get_object',
							//objversion: accessModule.getObjversionById('data', item.id),
							ROLE_ACCESS_GET_OBJECT_ID:item.id,
							ROLE_ID:role_id,
							EXECUTE_RU:(item.state)? 'TRUE': 'FALSE',
							sid:sid
						}
						MB.Core.sendQuery(o, function(ress){
							//console.log(ress.MESSAGE);
							sendRequest(++inter);
						});
						break;
					case 'method':
						var o = {
							command:'modify',
							object:'role_access_object',
							//objversion: accessModule.getObjversionById('method', item.id),
							ROLE_ACCESS_OBJECT_ID:item.id,
							ROLE_ID:role_id,
							MODIFY_COMMAND_RU: accessModule.getOtherCheckById(item.id, item.checkType, item.state).MODIFY,
							NEW_COMMAND_RU: accessModule.getOtherCheckById(item.id, item.checkType, item.state).NEW,
							REMOVE_COMMAND_RU: accessModule.getOtherCheckById(item.id, item.checkType, item.state).REMOVE,
							sid:sid
						}
						MB.Core.sendQuery(o, function(ress){
							//console.log(ress.MESSAGE);
							sendRequest(++inter);
						});
						break;
					case 'operation':
						var o = {
							command:'modify',
							object:'role_access_operation',
							//objversion: accessModule.getObjversionById('operation', item.id),
							ROLE_ACCESS_OPERATION_ID:item.id,
							ROLE_ID:role_id,
							EXECUTE_RU:(item.state)? 'TRUE': 'FALSE',
							sid:sid
						}
						MB.Core.sendQuery(o, function(ress){
							//console.log(ress.MESSAGE);
							sendRequest(++inter);
						});
						break;
					case 'menu':
						var o = {
							command:'modify',
							object:'role_access_menu',
							//objversion:accessModule.getObjversionById('menu', item.id),
							ROLE_ACCESS_MENU_ID:item.id,
							ROLE_ID:role_id,
							VISIBLE_RU:(item.state)? 'TRUE': 'FALSE',
							sid:sid
						};
						MB.Core.sendQuery(o, function(ress){
							//console.log(ress.MESSAGE);
							sendRequest(++inter);
						});
						break;
				}
			}
			sendRequest(inter);

			// for(var i in changedArray){
			// 	var item = changedArray[i];
			// 	switch(item.type){
			// 		case 'data':
			// 			var o = {
			// 				command:'modify',
			// 				object:'role_access_get_object',
			// 				//objversion: accessModule.getObjversionById('data', item.id),
			// 				ROLE_ACCESS_GET_OBJECT_ID:item.id,
			// 				ROLE_ID:role_id,
			// 				EXECUTE_RU:(item.state)? 'TRUE': 'FALSE',
			// 				sid:sid
			// 			}
			// 			MB.Core.sendQuery(o, function(ress){
			// 				console.log(ress.MESSAGE);
			// 			});
			// 			break;
			// 		case 'method':
			// 			var o = {
			// 				command:'modify',
			// 				object:'role_access_object',
			// 				//objversion: accessModule.getObjversionById('method', item.id),
			// 				ROLE_ACCESS_OBJECT_ID:item.id,
			// 				ROLE_ID:role_id,
			// 				MODIFY_COMMAND_RU: accessModule.getOtherCheckById(item.id, item.checkType, item.state).MODIFY,
			// 				NEW_COMMAND_RU: accessModule.getOtherCheckById(item.id, item.checkType, item.state).NEW,
			// 				REMOVE_COMMAND_RU: accessModule.getOtherCheckById(item.id, item.checkType, item.state).REMOVE,
			// 				sid:sid
			// 			}
			// 			MB.Core.sendQuery(o, function(ress){
			// 				console.log(ress.MESSAGE);
			// 			});
			// 			break;
			// 		case 'operation':
			// 			var o = {
			// 				command:'modify',
			// 				object:'role_access_operation',
			// 				//objversion: accessModule.getObjversionById('operation', item.id),
			// 				ROLE_ACCESS_OPERATION_ID:item.id,
			// 				ROLE_ID:role_id,
			// 				EXECUTE_RU:(item.state)? 'TRUE': 'FALSE',
			// 				sid:sid
			// 			}
			// 			MB.Core.sendQuery(o, function(ress){
			// 				console.log(ress.MESSAGE);
			// 			});
			// 			break;
			// 		case 'menu':
			// 			var o = {
			// 				command:'modify',
			// 				object:'role_access_menu',
			// 				//objversion:accessModule.getObjversionById('menu', item.id),
			// 				ROLE_ACCESS_MENU_ID:item.id,
			// 				ROLE_ID:role_id,
			// 				VISIBLE_RU:(item.state)? 'TRUE': 'FALSE',
			// 				sid:sid
			// 			}
			// 			MB.Core.sendQuery(o, function(ress){
			// 				console.log(ress.MESSAGE);
			// 			});
			// 			break;
			// 	}
			// }		
		},
		hightlightSearchResults: function(string){

			container.find('.accessBlock').removeClass('hightlighted');
			container.find('.accessBlock li').removeClass('hightlighted');
			
			if(string == "" || !string || string == " "){
				container.find('.accessBlock').removeClass('hightlighted');
				container.find('.accessBlock li').removeClass('hightlighted');
				return;
			}

			function hightLight(li){
				li.addClass('hightlighted');
				li.parents('.accessBlock').addClass('hightlighted');
			}

			var bCollection = container.find('.accessBlock');
			for(var i=0;i<bCollection.length; i++){
				var quatro = bCollection.eq(i).find('.tabulatorDDItem');
				for(var k=0;k<quatro.length;k++){
					var qBlock = quatro.eq(k);
					for(var j=0; j<qBlock.find('li').length;j++){
						var item = qBlock.find('li').eq(j);
						var keywordRu = item.find('.keywordRu').text().toLowerCase();
						var keyword = item.find('.keyword').text().toLowerCase();
						if(keywordRu.indexOf(string.toLowerCase())!= -1 || keyword.indexOf(string.toLowerCase())!= -1 ){
							hightLight(item);
						}
					}
				}
			}
		}
	};

	console.log(new Date());
	accessModule.getDataFormServer(function(serverData){
		serverModel = serverData;
		accessModule.separateByBlocks(serverData, function(separated){
			accessModule.render(separated, container, function(){
				accessModule.setHandlers(function(){
					console.log(new Date());
				});
			});
		});
	});
	MB.Core.accessModule = accessModule;
};

// DATA:

// order_status
// action_free_places
// order_ticket
// action_range_list
// user_blocked_places

// OPERATION:

// block_all_places
// to_pay_ticket
// on_realization_print_order
// cancel_order
// print_ticket
// create_reserv_order_without_places
// unblock_place_list
// to_pay_order
// on_realization_ticket
// set_order_payment_type
// unblock_place_price_group
// on_realization_print_ticket
// cancel_ticket
// clear_blocked_place
// defect_ticket
// create_to_pay_order_without_places
// create_to_pay_order
// return_order
// add_tickets_to_order
// close_realization_ticket
// print_order
// defect_blank
// print_ticket_by_server
// print_order_by_server
// send_delivery_note_to_email
// print_ticket_response

// METHOD:

// order - new, modify
// crm_user - new, modify

// ____________________________________________

// methods: 

// var method = {
// 	command:1,
// 	object:'role_access_object',
// 	objversion:1,
// 	ROLE_ACCESS_OBJECT_ID:1,
// 	ROLE_ID:1,
// 	MODIFY_COMMAND_RU:1,
// 	NEW_COMMAND_RU:1,
// 	REMOVE_COMMAND_RU:1,
// 	sid:1,
// }

// var operation = {
// 	command:1,
// 	object:'role_access_operation',
// 	objversion:1,
// 	ROLE_ACCESS_OPERATION_ID:1,
// 	ROLE_ID:1,
// 	EXECUTE_RU:1,
// 	sid:1,
// }

// var data = {
// 	command:1,
// 	object:'role_access_get_object',
// 	objversion:1,
// 	ROLE_ACCESS_GET_OBJECT_ID:1,
// 	ROLE_ID:1,
// 	EXECUTE_RU:1,
// 	sid:1,
// }
// var menu = {
// 	command:1,
// 	object:'role_access_menu',
// 	objversion:1,
// 	ROLE_ACCESS_MENU_ID:1,
// 	ROLE_ID:1,
// 	VISIBLE_RU:1,
// 	sid:1,
// }
// <query>
// 	<command>				modify</command>
// 	<object>				role_access_object</object>
// 	<objversion>			20140603121926</objversion>
// 	<ROLE_ACCESS_OBJECT_ID>	1808</ROLE_ACCESS_OBJECT_ID>
// 	<ROLE_ID>				35</ROLE_ID>
// 	<MODIFY_COMMAND_RU>		TRUE</MODIFY_COMMAND_RU>
// 	<NEW_COMMAND_RU>		FALSE</NEW_COMMAND_RU>
// 	<REMOVE_COMMAND_RU>		FALSE</REMOVE_COMMAND_RU>
// 	<sid>					PSMVVWhWwwPuxcHuoKrWhpPWpbMOcgBbFVXypUnPfvSIwNBXWA</sid>
// </query>

// <query>
// 	<command>				modify</command>
// 	<object>				role_access_object</object>
// 	<objversion>			20140603121926</objversion>
// 	<ROLE_ACCESS_OBJECT_ID>	1901</ROLE_ACCESS_OBJECT_ID>
// 	<ROLE_ID>				35</ROLE_ID>
// 	<MODIFY_COMMAND_RU>		FALSE</MODIFY_COMMAND_RU>
// 	<REMOVE_COMMAND_RU>		TRUE</REMOVE_COMMAND_RU>
// 	<NEW_COMMAND_RU>		TRUE</NEW_COMMAND_RU>
// 	<sid>					PSMVVWhWwwPuxcHuoKrWhpPWpbMOcgBbFVXypUnPfvSIwNBXWA</sid>
// </query>
// ____________________________________________

// operations: 

// <query>
// 	<command>					modify</command>
// 	<object>					role_access_operation</object>
// 	<objversion>				20140603122935</objversion>
// 	<ROLE_ACCESS_OPERATION_ID>	1355</ROLE_ACCESS_OPERATION_ID>
// 	<ROLE_ID>					35</ROLE_ID>
// 	<EXECUTE_RU>				FALSE</EXECUTE_RU>
// 	<sid>						PSMVVWhWwwPuxcHuoKrWhpPWpbMOcgBbFVXypUnPfvSIwNBXWA</sid>
// </query>

//_______________________________________________

//data:

// <query>
// 	<command>modify</command>
// 	<object>role_access_get_object</object>
// 	<objversion>20140506094451</objversion>
// 	<ROLE_ACCESS_GET_OBJECT_ID>2927</ROLE_ACCESS_GET_OBJECT_ID>
// 	<ROLE_ID>35</ROLE_ID>
// 	<EXECUTE_RU>TRUE</EXECUTE_RU>
// 	<sid>PSMVVWhWwwPuxcHuoKrWhpPWpbMOcgBbFVXypUnPfvSIwNBXWA</sid>
// </query>

// _________________________________________________

// menu:



// <query>
// 	<command>modify</command>
// 	<object>role_access_menu</object>
// 	<objversion>20140220133952</objversion>
// 	<ROLE_ACCESS_MENU_ID>931</ROLE_ACCESS_MENU_ID>
// 	<ROLE_ID>35</ROLE_ID>
// 	<VISIBLE_RU>TRUE</VISIBLE_RU>
// 	<sid>PSMVVWhWwwPuxcHuoKrWhpPWpbMOcgBbFVXypUnPfvSIwNBXWA</sid>
// </query>

//<query><command>modify</command><object>role_access_menu</object><ROLE_ACCESS_MENU_ID>841</ROLE_ACCESS_MENU_ID><ROLE_ID>34</ROLE_ID><VISIBLE_RU>TRUE</VISIBLE_RU><sid>SGMGcFzsmDlXNjuyiYegtrTcFTprXFQoSPKUJEcYkQFPudeKUG</sid><in_out_key>YQTohKFxGdKskVsdssti</in_out_key></query>
//<query><command>modify</command><object>role_access_menu</object><ROLE_ACCESS_MENU_ID>758</ROLE_ACCESS_MENU_ID><ROLE_ID>34</ROLE_ID><VISIBLE_RU>TRUE</VISIBLE_RU><sid>SGMGcFzsmDlXNjuyiYegtrTcFTprXFQoSPKUJEcYkQFPudeKUG</sid><in_out_key>YQTohKFxGdKskVsdssti</in_out_key></query>
//<objversion>20140909182006</objversion>