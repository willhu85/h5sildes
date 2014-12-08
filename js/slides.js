/**
 * Created by willhu on 2014/12/01
 */
;(function($) {
	$.extend({
		wwSlide: {
			// 激活的slide
			activeSlide: null,
			// 激活的动画
			activeAnimate: null,
			// 全部幻灯片
			arraySlide: [],
			// 全部含动画的部件 （即有些段落会有淡入淡出的动画）
			arrayAnimate: [],
			// 幻灯片索引
			indexSlide: 0,
			// 动画部件索引
			indexAnimate: 0,
			arrayTools: ["Home","Remind","Background","Previous", "Next","List"],
			// 本地存储时间提醒
			//timeLocalstorageKey: location.href.split("#")[0] + "wwTime",
			//bgLocalstorageKey: location.href.split("#")[0] + "wwBg",

			// slide 显隐 两个参数，一个参数是当前slide 一个是参数是目标slide
			visible: function(activeSlide, targetSlide) {
				// 如果有当前slide,则去除class
				if(activeSlide) {
					activeSlide.removeClass("ww-slide-curr");
				}
				// 动画时间400ms
				setTimeout(function() {
					//改变url地址栏的快速锚点
					location.replace(location.href.split("#")[0] + "#" + targetSlide.attr("id"));
				}, 100);

				// 当前激活slide变为之前目标slide
				targetSlide.addClass("ww-slide-curr").trigger("slideload");
				this.activeSlide = targetSlide;
				// 当前激活slide的index变为目标slide的index
				this.indexSlide = targetSlide.data("indexSlide");
				// 触发进度条事件
				this.process();
				return this;
			},
			process: function() {
				var nowSlide = this.indexSlide + 1,
					totalSlide = this.arraySlide.length;
				if(nowSlide === totalSlide) {
					this.eleProcess.html("&nbsp;").width("100%");
				} else {
					this.eleProcess.html(nowSlide).width(nowSlide / totalSlide * 100 + "%");
				}
			},
			group: function() {
				// 把slide和动画部件放入数组中
				var _arraySlide = [],
					_arrayAnimate = [],
					_indexAnimate = 0;
				// 所有slide部分
				var eleSlide = $("div[data-role='slide']");
				eleSlide.each(function(indexSlide) {
					$(this).data("index", _indexAnimate);
					_arrayAnimate.push($(this));
					$(this).data("indexSlide", indexSlide);
					_arraySlide.push($(this));
					_indexAnimate++;
					var eleFade = $(this).find("[data-role='fade']");
					eleFade.each(function() {
						$(this).data("index", _indexAnimate);
						_arrayAnimate.push($(this));
						_indexAnimate++;
					});
				});
				this.arraySlide = _arraySlide;
				this.arrayAnimate = _arrayAnimate;
				return this
			},
			initIndex: function() {
				// 根据URL获取slide索引值
				var targetId = location.href.split("#")[1];
				var targetElement;
				if (targetId) {
					targetElement = $("#" + targetId);
				}
				// 如果锚点不存在，或锚点对应元素不存在，index=0
				if (targetElement && targetElement.length) {
					this.indexSlide = targetElement.data("indexSlide") || 0;
					this.indexAnimate = targetElement.data("index") || 0;
				} else {
					this.indexSlide = 0;
					this.indexAnimate = 0;
				}
				return this;
			},
			// 切换
			slide: function() {
				// 动画个页面的切换主要由 indexAnimate决定
				var eleBeingAnimate = this.arrayAnimate[this.indexAnimate];
				var roleBeingAnimate;
				if (eleBeingAnimate) {
					roleBeingAnimate = eleBeingAnimate.attr("data-role");
				}
				// 上一页下一页  当前活动页面和动画的索引
				var elePrevSlide = this.arraySlide[this.indexSlide - 1];
					//eleNextSlide = this.arraySlide[this.indexSlide + 1];
					// 默认index为-1
					var indexActiveSlide = -1;
					var	indexActiveAnimate = -1;

				if (this.activeSlide) {
					// 当前显示page的index
					indexActiveSlide = this.activeSlide.data("index");
				}
				if (this.activeAnimate) {
					// 当前动画的index
					indexActiveAnimate = this.activeAnimate.data("index");
				}

				if (roleBeingAnimate) {
					if (roleBeingAnimate === "fade") {
						// 如果当前的是fade元素
						// 当前动画的index和当前slide页面的index对比
						if (this.indexAnimate < indexActiveSlide) {
							// 当前页离开
							this.activeSlide.removeClass("in").addClass("out reverse");
							// 目标页进入
							elePrevSlide.removeClass("out").addClass("in reverse");
							// 显示目标元素
							this.visible(this.activeSlide, elePrevSlide);
							elePrevSlide.find("[data-role='fade']").removeClass("out").addClass("in");
						} else {
							// 索引值比较前进
							if (this.indexAnimate > indexActiveAnimate) {
								eleBeingAnimate.removeClass("out").addClass("in");
							} else {
								this.activeAnimate.removeClass("in").addClass("out");
							}
						}
					} else if (roleBeingAnimate === "slide") {
						if (!this.activeSlide) {
							// 此时为直接载入的情况
							//eleBeingAnimate.addClass("in")
						} else if (this.indexAnimate > indexActiveSlide) {
							// 即将展示页的索引大于当前页的索引，前进
							// 当前页左边移出
							this.activeSlide.removeClass("in reverse").addClass("out");
							// 即将展示页面右边进入
							eleBeingAnimate.removeClass("out reverse").addClass("in");
						} else if (this.indexAnimate < indexActiveSlide) {
							// 即将展示页的索引小于当前页的索引，后退
							// 当前页右边移出
							this.activeSlide.removeClass("in").addClass("out reverse");
							// 即将展示页左侧进入
							eleBeingAnimate.removeClass("out").addClass("in reverse");
						}

						eleBeingAnimate.find("[data-role='fade']").removeClass("in out");
						this.visible(this.activeSlide, eleBeingAnimate);
					}
					this.activeAnimate = eleBeingAnimate;
				}
				return this;
			},
			// 各种事件
			events: function() {
				var indexAnimate = this.indexAnimate,
					arrayAnimate = this.arrayAnimate,
					self = this;
				var funIndexAnimate = function() {
					if (indexAnimate >= arrayAnimate.length) {
						indexAnimate = arrayAnimate.length -1;
						alert("结束，谢谢观赏！");
					} else if (indexAnimate < 0) {
						indexAnimate = 0;
						alert("已经到头了！");
					} else {
						self.indexAnimate = indexAnimate;
						self.slide();
					}
				};

				// 键盘事件
				$(document).bind({
					// 键盘事件
					"keyup": function(event) {
						var keyCode = event.keyCode;
						// 下一页
						if (keyCode === 39) {
							indexAnimate++;
							event.preventDefault();
							funIndexAnimate();
						} else if (keyCode === 37) {
							indexAnimate--;
							event.preventDefault();
							funIndexAnimate();
						} else if (keyCode === 32) {
							// 隐藏工具条
							self.eleFooter.toggle();
							self.eleHeader.toggle();
						}
					},
					// 3秒后鼠标消失
					"mousemove": function() {
						if (self.timerMouse) {
							clearTimeout(self.timerMouse);
							$("body").css("cursor", "auto");
						}
						self.timerMouse = setTimeout(function() {
							$("body").css("cursor", "none");
						}, 3000);
					}
				});

				// 工具栏事件
				if (this.eleToolBar) {
					// 点击的时候判断data-key，从而判断执行事件
					this.eleToolBar.find("[data-role='tool']").bind("click", function() {
						var keyTools = $(this).attr("data-key");
						switch (keyTools) {
							// 返回首页
							case "Home": {
								indexAnimate = 0;
								funIndexAnimate();
								break;
							}
							// 上一个
							case "Previous": {
								indexAnimate--;
								funIndexAnimate();
								break;
							}
							// 下一个
							case "Next": {
								indexAnimate++;
								funIndexAnimate();
								break;
							}
							// 跳转
                            case "List": {
                                var pageNum = prompt("请输入页码", "", function() {
                                    alert(pageNum)
                                });
//								prompt("请选择跳转到的页面", function() {
//
//								}, function() {
//
//								});
							}
                            // 改变背景
                            case "Background": {

                            }
                            // 设定提醒
                            case "Remind": {

                            }
						}
						return false;
					});
				}

				return this;
			},
			// 工具栏和头部进度条
			tools: function() {
				var eleHeader = $("[data-role='header']").eq(0);
				var eleFooter = $("[data-role='footer']").eq(0);
				// 头部进度条
				if (eleHeader) {
					this.eleHeader = eleHeader;
					this.eleTotal = $("<strong class='ww-silde-total'></strong>").html(this.arraySlide.length);
					this.eleProcess = $("<strong class='ww-silde-progress'></strong>");

					this.eleHeader.append(this.eleProcess).append(this.eleTotal);
					this.process();
				}
				var toolsTitles = {
					"Home": "回到首页|&#x3435;",
					"Remind": "添加提醒|&#xf00b5;",
					"Background": "修改背景|&#xe60b;",
					"Previous": "前一页|&#xf007a;",
					"Next": "下一页|&#xe646;",
					"List": "快速跳转|&#xe670;"
				};
				// 底部工具栏
				if (eleFooter) {
					var toolsHtml = "";
					$.each(this.arrayTools, function(index, key) {
						var arrayToolsBtn;
						if(toolsTitles[key]) {
							arrayToolsBtn = toolsTitles[key].split("|");
							toolsHtml = toolsHtml + " <a href='javascript:;' class='ww-tool' title='" + arrayToolsBtn[0] + "' data-key='" + key + "' data-title='" + arrayToolsBtn[0] +"' data-role='tool'>" + arrayToolsBtn[1] + "</a>";
						}
					});

					toolsHtml = toolsHtml + "&nbsp;<a href='javascript:;' class='ww-tool' data-title='帮助' data-role='tool'>&#xe63d;</a>";
					this.eleToolBar = $("<div class='ww-tool-bar'></div>").html(toolsHtml);
					this.eleFooter = eleFooter;
					this.eleFooter.append(this.eleToolBar);

				}

				return this;
			},
			//初始化
			init: function() {
				this.group().initIndex().tools().events().slide()
			}

		}
	})
})(jQuery);