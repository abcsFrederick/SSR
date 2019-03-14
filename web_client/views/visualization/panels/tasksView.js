import View from 'girder/views/View';
import panelTemplate from '../../../templates/visualization/panels/panel.pug';
import TitlesView from './titlesView';
import { restRequest } from 'girder/rest';

var TasksView = View.extend({
  events:{
    'click .g-nav-link-history-task': 'findTitle'
  },
  initialize(settings){
    this.dockerImages = settings.dockerImages || '';
    this.userId = settings.userId;
    this.$el.html(panelTemplate({
      panel:'task',
      dockerImages: this.dockerImages
    }))
  },
  findTitle(e){
    restRequest({
        url: 'SSR',
        data:{userId:this.userId, dockerImage:$(e.currentTarget).attr('dockerImage'), limit:0}
    }).done(_.bind(function(res) {
      let titles = [];
      var uniqueTitles = [];
      for(let a = 0; a < res.length; a++){
        titles.push(res[a].task.title);
      }
      $.each(titles, function(i, el){
          if($.inArray(el, uniqueTitles) === -1) uniqueTitles.push(el);
      });
      console.log('click');
      if(this.titlesView){
        this.titlesView.destroy()
      }
      this.titlesView = new TitlesView({
        dockerImage:$(e.currentTarget).attr('dockerImage'),
        userId: this.userId,
        titles: uniqueTitles,
        parentView:this
      })
      $('.history-title').html(this.titlesView.el);
      // console.log(titles)
    },this))
  },
});

export default TasksView;